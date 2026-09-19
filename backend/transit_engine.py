import json
import os
import time
import math
from datetime import datetime, timedelta

class TransitEngine:
    def __init__(self, config_path=None):
        if not config_path:
            config_path = os.path.join(os.path.dirname(__file__), 'data', 'city_config.json')
        self.config_path = config_path
        self.load_config()
        self.simulated_clock = datetime(2026, 9, 18, 23, 45, 0)
        self.disrupted_routes = set()
        self.route_delays = {}
        self.vehicles = self._initialize_vehicles()

    def load_config(self):
        with open(self.config_path, 'r', encoding='utf-8') as f:
            self.config = json.load(f)
        self.stops_by_id = {s['id']: s for s in self.config['stops']}
        self.routes_by_id = {r['id']: r for r in self.config['routes']}
        self.help_points_by_id = {h['id']: h for h in self.config.get('help_points', [])}

    def _initialize_vehicles(self):
        vehicles = []
        for i, route in enumerate(self.config['routes']):
            route_stops = [self.stops_by_id[s_id] for s_id in route['stops'] if s_id in self.stops_by_id]
            if len(route_stops) >= 2:
                vehicles.append({
                    'id': f"veh_{route['code']}_01",
                    'route_id': route['id'],
                    'route_code': route['code'],
                    'route_name': route['name'],
                    'route_color': route['color'],
                    'from_stop_idx': 0,
                    'to_stop_idx': 1,
                    'progress': 0.35, # 0.0 to 1.0 along segment
                    'lat': route_stops[0]['lat'] * 0.65 + route_stops[1]['lat'] * 0.35,
                    'lng': route_stops[0]['lng'] * 0.65 + route_stops[1]['lng'] * 0.35,
                    'speed_kmh': 38.0,
                    'status': route.get('default_status', 'On Time'),
                    'delay_min': route.get('delay_minutes', 0),
                    'occupancy_pct': 42
                })
                # If route has 4+ stops, add a second vehicle traveling in opposite or later phase
                if len(route_stops) >= 4:
                    vehicles.append({
                        'id': f"veh_{route['code']}_02",
                        'route_id': route['id'],
                        'route_code': route['code'],
                        'route_name': route['name'],
                        'route_color': route['color'],
                        'from_stop_idx': 2,
                        'to_stop_idx': 3,
                        'progress': 0.70,
                        'lat': route_stops[2]['lat'] * 0.3 + route_stops[3]['lat'] * 0.7,
                        'lng': route_stops[2]['lng'] * 0.3 + route_stops[3]['lng'] * 0.7,
                        'speed_kmh': 42.0,
                        'status': route.get('default_status', 'On Time'),
                        'delay_min': route.get('delay_minutes', 0),
                        'occupancy_pct': 28
                    })
        return vehicles

    def step_simulation(self, delta_seconds=4.0):
        # Progress vehicle positions along route segments
        for veh in self.vehicles:
            route = self.routes_by_id.get(veh['route_id'])
            if not route or veh['route_id'] in self.disrupted_routes:
                veh['status'] = 'Disrupted'
                veh['speed_kmh'] = 0.0
                continue
                
            stops_seq = [self.stops_by_id[s_id] for s_id in route['stops'] if s_id in self.stops_by_id]
            if len(stops_seq) < 2:
                continue
                
            # Increase progress
            speed_fraction = 0.04 # movement step per tick
            veh['progress'] += speed_fraction
            
            if veh['progress'] >= 1.0:
                veh['progress'] = 0.0
                veh['from_stop_idx'] = veh['to_stop_idx']
                veh['to_stop_idx'] = (veh['to_stop_idx'] + 1) % len(stops_seq)
                
            s_from = stops_seq[veh['from_stop_idx']]
            s_to = stops_seq[veh['to_stop_idx']]
            p = veh['progress']
            
            # Linear interpolation
            veh['lat'] = round(s_from['lat'] * (1 - p) + s_to['lat'] * p, 6)
            veh['lng'] = round(s_from['lng'] * (1 - p) + s_to['lng'] * p, 6)
            
            # Apply dynamic delay status
            custom_delay = self.route_delays.get(veh['route_id'], route.get('delay_minutes', 0))
            veh['delay_min'] = custom_delay
            if custom_delay >= 12:
                veh['status'] = 'Delayed'
            elif veh['route_id'] in self.disrupted_routes:
                veh['status'] = 'Disrupted'
            else:
                veh['status'] = 'On Time'

    def get_live_routes(self):
        # Return all routes with up-to-date statuses and delay info
        routes = []
        for r in self.config['routes']:
            r_copy = dict(r)
            r_id = r['id']
            if r_id in self.disrupted_routes:
                r_copy['status'] = 'Disrupted'
                r_copy['delay_minutes'] = 99
                r_copy['status_badge_color'] = '#ef4444' # Red
            else:
                delay = self.route_delays.get(r_id, r.get('delay_minutes', 0))
                r_copy['delay_minutes'] = delay
                if delay >= 10:
                    r_copy['status'] = 'Delayed'
                    r_copy['status_badge_color'] = '#f59e0b' # Amber
                else:
                    r_copy['status'] = 'On Time'
                    r_copy['status_badge_color'] = '#10b981' # Green
            
            # Calculate next departure
            freq = r.get('frequency_min', 20)
            mins_past = self.simulated_clock.minute % freq
            wait_time = max(2, freq - mins_past + r_copy['delay_minutes'])
            r_copy['next_departure_in_min'] = wait_time
            r_copy['next_departure_time'] = (self.simulated_clock + timedelta(minutes=wait_time)).strftime('%H:%M')
            routes.append(r_copy)
        return routes

    def find_routes_between(self, origin_id, dest_id):
        # Find direct routes first, then connecting routes
        direct_routes = []
        for route in self.get_live_routes():
            stops = route['stops']
            if origin_id in stops and dest_id in stops:
                orig_idx = stops.index(origin_id)
                dest_idx = stops.index(dest_id)
                # Traveling forward along the route or bidirectional
                num_stops = abs(dest_idx - orig_idx)
                travel_time = num_stops * 6 + route['delay_minutes']
                direct_routes.append({
                    'route': route,
                    'is_direct': True,
                    'origin_id': origin_id,
                    'destination_id': dest_id,
                    'stops_count': num_stops,
                    'estimated_travel_min': travel_time,
                    'total_eta_min': travel_time + route['next_departure_in_min']
                })
        
        # If no direct route, find transfer routes through Central Interchange ('stop_04')
        if not direct_routes and origin_id != 'stop_04' and dest_id != 'stop_04':
            # Leg 1: origin -> stop_04, Leg 2: stop_04 -> dest
            leg1_candidates = [r for r in self.get_live_routes() if origin_id in r['stops'] and 'stop_04' in r['stops']]
            leg2_candidates = [r for r in self.get_live_routes() if 'stop_04' in r['stops'] and dest_id in r['stops']]
            
            if leg1_candidates and leg2_candidates:
                r1 = leg1_candidates[0]
                r2 = leg2_candidates[0]
                total_time = r1['base_duration_min'] // 2 + r2['base_duration_min'] // 2 + 10
                direct_routes.append({
                    'route': r1,
                    'transfer_route': r2,
                    'is_direct': False,
                    'transfer_stop_id': 'stop_04',
                    'origin_id': origin_id,
                    'destination_id': dest_id,
                    'stops_count': 6,
                    'estimated_travel_min': total_time,
                    'total_eta_min': total_time + r1['next_departure_in_min']
                })
        return direct_routes

    def get_safer_alternatives(self, current_route_id, origin_id, dest_id, risk_engine):
        all_options = self.find_routes_between(origin_id, dest_id)
        current_hour = self.simulated_clock.hour
        
        current_eval = risk_engine.evaluate_route(
            current_route_id, origin_id, dest_id, 
            current_hour=current_hour,
            custom_delay=self.route_delays.get(current_route_id, 0)
        )
        current_risk_score = current_eval['risk_score']

        alternatives = []
        for opt in all_options:
            r = opt['route']
            if r['id'] == current_route_id and r['status'] != 'Disrupted':
                continue # Skip the exact currently selected route unless it is disrupted
                
            eval_res = risk_engine.evaluate_route(
                r['id'], origin_id, dest_id,
                current_hour=current_hour,
                custom_delay=self.route_delays.get(r['id'], 0)
            )
            
            # Determine badges
            badges = []
            if eval_res['risk_score'] < current_risk_score:
                diff = current_risk_score - eval_res['risk_score']
                badges.append(f"🛡️ {diff} pts safer")
                
            if r['type'] == 'Metro Express':
                badges.append("🚇 Monitored Metro Corridor")
            elif r['night_safety_tier'] == 'High':
                badges.append("✨ High Night Safety Tier")
                
            if r['delay_minutes'] == 0:
                badges.append("⏱️ Zero Delay")

            if opt.get('total_eta_min', 30) < 25:
                badges.append("⚡ Fast Transit")

            alternatives.append({
                'route_id': r['id'],
                'route_code': r['code'],
                'route_name': r['name'],
                'color': r['color'],
                'status': r['status'],
                'delay_minutes': r['delay_minutes'],
                'wait_time_min': r['next_departure_in_min'],
                'total_eta_min': opt['total_eta_min'],
                'risk_score': eval_res['risk_score'],
                'risk_tier': eval_res['risk_tier'],
                'tier_color': eval_res['tier_color'],
                'badges': badges,
                'why_safer': eval_res['top_factors'][0] if eval_res['top_factors'] else "Lower overall exposure",
                'is_direct': opt.get('is_direct', True)
            })

        # Sort alternatives by risk_score ascending, then wait time
        alternatives.sort(key=lambda x: (x['risk_score'], x['wait_time_min']))
        return alternatives

    def find_nearest_help_points(self, lat, lng, limit=3):
        # Calculate Haversine distance in meters to each help point
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371000 # Earth radius in meters
            phi1 = math.radians(lat1)
            phi2 = math.radians(lat2)
            delta_phi = math.radians(lat2 - lat1)
            delta_lambda = math.radians(lon2 - lon1)
            a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return R * c

        results = []
        for hp in self.config.get('help_points', []):
            dist_m = haversine(lat, lng, hp['lat'], hp['lng'])
            results.append({
                **hp,
                'distance_meters': int(dist_m),
                'distance_formatted': f"{dist_m / 1000:.1f} km" if dist_m >= 1000 else f"{int(dist_m)} m",
                'walking_time_min': max(1, int(dist_m / 80)) # ~80 meters per min
            })
            
        results.sort(key=lambda x: x['distance_meters'])
        return results[:limit]

    # Demo Panel Controls
    def inject_delay(self, route_id, delay_minutes=25):
        self.route_delays[route_id] = delay_minutes

    def inject_disruption(self, route_id):
        self.disrupted_routes.add(route_id)

    def fast_forward(self, minutes=10):
        self.simulated_clock += timedelta(minutes=minutes)

    def reset_demo(self):
        self.disrupted_routes.clear()
        self.route_delays.clear()
        self.simulated_clock = datetime(2026, 9, 18, 23, 45, 0)
        self.vehicles = self._initialize_vehicles()
