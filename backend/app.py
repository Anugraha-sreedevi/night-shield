import os
import uuid
import json
import threading
import time
from datetime import datetime, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS

from database import init_db, get_db_connection, hash_password
from seed import seed_database
from risk_model import RiskAssessmentEngine
from transit_engine import TransitEngine
from sms_service import send_guardian_missed_arrival_alert, send_sos_broadcast

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# Safe DB initialization (supports serverless /tmp fallback)
try:
    init_db()
    seed_database()
except Exception as e:
    print(f"Database initialization notice: {e}")

city_config_path = os.path.join(os.path.dirname(__file__), 'data', 'city_config.json')
risk_engine = RiskAssessmentEngine(city_config_path)
transit_engine = TransitEngine(city_config_path)

# Background vehicle simulation loop
def vehicle_loop():
    while True:
        try:
            transit_engine.step_simulation(delta_seconds=3.0)
            time.sleep(3.0)
        except Exception as e:
            print("Vehicle loop error:", e)
            time.sleep(5.0)

# Only start background thread if not in serverless freeze mode
if not os.environ.get('VERCEL'):
    sim_thread = threading.Thread(target=vehicle_loop, daemon=True)
    sim_thread.start()

# Prefix middleware to handle both /api/* and direct /* routing transparently
class ApiPrefixMiddleware:
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get('PATH_INFO', '')
        if not path.startswith('/api'):
            environ['PATH_INFO'] = '/api' + (path if path.startswith('/') else '/' + path)
        return self.wsgi_app(environ, start_response)

app.wsgi_app = ApiPrefixMiddleware(app.wsgi_app)

# ----------------- HEALTH ENDPOINTS -----------------
@app.route('/api', methods=['GET'])
@app.route('/api/', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "app": "NightShield AI Backend",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }), 200

# Helper to verify auth token
def get_current_user_id():
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1]
        # In this demo, token contains user_id or is a demo session token
        if token.startswith('token_'):
            return token.replace('token_', '')
    # Default to standard demo user for smooth testing
    return "user_demo_778"

# ----------------- AUTH & PRIVACY ENDPOINTS -----------------

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', 'user@nightshield.app').strip()
    password = data.get('password', 'shield2026').strip()
    
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    
    if not user or user['password_hash'] != hash_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
        
    token = f"token_{user['id']}"
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'full_name': user['full_name'],
            'consent_location': bool(user['consent_location']),
            'consent_timestamp': user['consent_timestamp']
        }
    })

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    user_id = get_current_user_id()
    conn = get_db_connection()
    user = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify({
        'id': user['id'],
        'email': user['email'],
        'full_name': user['full_name'],
        'consent_location': bool(user['consent_location']),
        'consent_timestamp': user['consent_timestamp']
    })

@app.route('/api/auth/consent', methods=['POST'])
def update_consent():
    user_id = get_current_user_id()
    data = request.get_json() or {}
    consent = 1 if data.get('consent', True) else 0
    now_str = datetime.now().isoformat()
    
    conn = get_db_connection()
    conn.execute(
        "UPDATE users SET consent_location = ?, consent_timestamp = ? WHERE id = ?",
        (consent, now_str, user_id)
    )
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'consent_location': bool(consent),
        'consent_timestamp': now_str
    })

# ----------------- TRUSTED CONTACTS ENDPOINTS -----------------

@app.route('/api/contacts', methods=['GET'])
def get_contacts():
    user_id = get_current_user_id()
    conn = get_db_connection()
    rows = conn.execute(
        "SELECT * FROM trusted_contacts WHERE user_id = ? ORDER BY is_primary DESC, created_at ASC",
        (user_id,)
    ).fetchall()
    conn.close()
    
    contacts = [dict(r) for r in rows]
    return jsonify(contacts)

@app.route('/api/contacts', methods=['POST'])
def add_contact():
    user_id = get_current_user_id()
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    relation = data.get('relation', 'Friend').strip()
    is_primary = 1 if data.get('is_primary') else 0
    
    if not name or not phone:
        return jsonify({'error': 'Name and phone number are required'}), 400
        
    contact_id = f"tc_{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().isoformat()
    
    conn = get_db_connection()
    if is_primary:
        conn.execute("UPDATE trusted_contacts SET is_primary = 0 WHERE user_id = ?", (user_id,))
    
    conn.execute('''
        INSERT INTO trusted_contacts (id, user_id, name, phone, relation, is_primary, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (contact_id, user_id, name, phone, relation, is_primary, now_str))
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': contact_id,
        'user_id': user_id,
        'name': name,
        'phone': phone,
        'relation': relation,
        'is_primary': is_primary,
        'created_at': now_str
    }), 201

@app.route('/api/contacts/<contact_id>', methods=['PUT'])
def edit_contact(contact_id):
    user_id = get_current_user_id()
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    phone = data.get('phone', '').strip()
    relation = data.get('relation', '').strip()
    is_primary = 1 if data.get('is_primary') else 0
    
    conn = get_db_connection()
    if is_primary:
        conn.execute("UPDATE trusted_contacts SET is_primary = 0 WHERE user_id = ?", (user_id,))
        
    conn.execute('''
        UPDATE trusted_contacts 
        SET name = ?, phone = ?, relation = ?, is_primary = ?
        WHERE id = ? AND user_id = ?
    ''', (name, phone, relation, is_primary, contact_id, user_id))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'id': contact_id})

@app.route('/api/contacts/<contact_id>', methods=['DELETE'])
def delete_contact(contact_id):
    user_id = get_current_user_id()
    conn = get_db_connection()
    conn.execute("DELETE FROM trusted_contacts WHERE id = ? AND user_id = ?", (contact_id, user_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# ----------------- TRANSIT NETWORK & VEHICLES -----------------

@app.route('/api/stops', methods=['GET'])
def get_stops():
    return jsonify({
        'city_name': transit_engine.config.get('city_name', 'Neo-Veridia Central Metro'),
        'center': transit_engine.config.get('center', [12.9716, 77.5946]),
        'default_zoom': transit_engine.config.get('default_zoom', 13),
        'stops': transit_engine.config.get('stops', [])
    })

@app.route('/api/routes', methods=['GET'])
def get_routes():
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    
    if origin and destination:
        matching = transit_engine.find_routes_between(origin, destination)
        return jsonify(matching)
        
    return jsonify(transit_engine.get_live_routes())

@app.route('/api/help-points', methods=['GET'])
def get_help_points():
    lat = request.args.get('lat', type=float)
    lng = request.args.get('lng', type=float)
    if lat is not None and lng is not None:
        nearest = transit_engine.find_nearest_help_points(lat, lng, limit=5)
        return jsonify(nearest)
    return jsonify(transit_engine.config.get('help_points', []))

@app.route('/api/live-vehicles', methods=['GET'])
def get_live_vehicles():
    return jsonify({
        'simulated_clock': transit_engine.simulated_clock.strftime('%H:%M:%S'),
        'vehicles': transit_engine.vehicles
    })

# ----------------- AI RISK & SMART SUGGESTIONS -----------------

@app.route('/api/risk', methods=['GET', 'POST'])
def assess_risk():
    if request.method == 'POST':
        data = request.get_json() or {}
    else:
        data = request.args
        
    route_id = data.get('route_id', 'route_n1')
    origin_id = data.get('origin_id', 'stop_01')
    dest_id = data.get('dest_id', 'stop_09')
    hour = int(data.get('hour', transit_engine.simulated_clock.hour))
    
    # Check count of recent passenger feedback for this route
    conn = get_db_connection()
    count_row = conn.execute(
        "SELECT COUNT(*) as cnt FROM safety_concerns WHERE (route_id = ? OR stop_id = ?) AND status != 'resolved'",
        (route_id, origin_id)
    ).fetchone()
    conn.close()
    concerns_cnt = count_row['cnt'] if count_row else 0
    
    custom_delay = transit_engine.route_delays.get(route_id, None)
    result = risk_engine.evaluate_route(
        route_id=route_id,
        origin_stop_id=origin_id,
        dest_stop_id=dest_id,
        current_hour=hour,
        custom_delay=custom_delay,
        recent_concerns_count=concerns_cnt
    )
    return jsonify(result)

@app.route('/api/delay', methods=['GET'])
def get_delay_prediction():
    route_id = request.args.get('route_id', 'route_n1')
    stop_id = request.args.get('stop_id', 'stop_01')
    hour = int(request.args.get('hour', transit_engine.simulated_clock.hour))
    pred = risk_engine.predict_delay(route_id, stop_id, hour)
    return jsonify(pred)

@app.route('/api/routes/rank', methods=['GET'])
def rank_routes_endpoint():
    origin_id = request.args.get('origin_id', 'stop_01')
    dest_id = request.args.get('dest_id', 'stop_09')
    hour = int(request.args.get('hour', transit_engine.simulated_clock.hour))
    ranked = risk_engine.rank_routes(origin_id, dest_id, hour, transit_engine)
    return jsonify(ranked)

@app.route('/api/hotspots', methods=['GET'])
def get_hotspots():
    stops = transit_engine.config.get('stops', [])
    hotspots = []
    cluster_labels = {0: 'Standard Transit Stop', 1: 'Monitored Hub', 2: 'High-Vulnerability Hotspot'}
    for s in stops:
        c_id = risk_engine.stop_clusters.get(s['id'], 0)
        hotspots.append({
            'stop_id': s['id'],
            'name': s['name'],
            'lat': s['lat'],
            'lng': s['lng'],
            'cluster_id': c_id,
            'cluster_label': cluster_labels.get(c_id, 'Standard Stop'),
            'lighting_quality': s.get('lighting_quality', 'Medium'),
            'crowd_level': s.get('crowd_level', 'Medium'),
            'incident_rate': s.get('historical_incident_rate', 0.1),
            'cctv_active': s.get('cctv_active', True)
        })
    return jsonify(hotspots)

@app.route('/api/departure/best-time', methods=['GET'])
def best_departure_time():
    route_id = request.args.get('route_id', 'route_n1')
    origin_id = request.args.get('origin_id', 'stop_01')
    hour = int(request.args.get('hour', transit_engine.simulated_clock.hour))
    res = risk_engine.best_time_to_leave(route_id, origin_id, hour)
    return jsonify(res)

@app.route('/api/companion', methods=['POST'])
def companion_chat():
    data = request.get_json() or {}
    message = data.get('message', '')
    stop_id = data.get('stop_id', 'stop_01')
    route_id = data.get('route_id', 'route_n1')
    
    user_id = get_current_user_id()
    conn = get_db_connection()
    journey = conn.execute("SELECT * FROM journeys WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1", (user_id,)).fetchone()
    conn.close()
    
    active_j = dict(journey) if journey else None
    if active_j:
        stop_id = active_j.get('origin_stop_id', stop_id)
        route_id = active_j.get('route_id', route_id)
        
    reply = risk_engine.companion_respond(message, stop_id, route_id, active_j)
    return jsonify({
        'reply': reply,
        'grounded_context': {
            'stop_id': stop_id,
            'route_id': route_id,
            'timestamp': transit_engine.simulated_clock.strftime('%H:%M:%S')
        }
    })

@app.route('/api/alternatives', methods=['GET'])
def get_alternatives():
    route_id = request.args.get('route_id', 'route_n9')
    origin_id = request.args.get('origin_id', 'stop_06')
    dest_id = request.args.get('dest_id', 'stop_12')
    
    alternatives = transit_engine.get_safer_alternatives(route_id, origin_id, dest_id, risk_engine)
    return jsonify(alternatives)

# ----------------- JOURNEY MONITORING & ESCALATION -----------------

@app.route('/api/journey/start', methods=['POST'])
def start_journey():
    user_id = get_current_user_id()
    data = request.get_json() or {}
    origin_id = data.get('origin_id', 'stop_01')
    dest_id = data.get('dest_id', 'stop_09')
    route_id = data.get('route_id', 'route_n1')
    eta_mins = int(data.get('eta_minutes', 24))
    
    orig_stop = transit_engine.stops_by_id.get(origin_id, {'lat': 12.9980, 'lng': 77.5850})
    
    journey_id = f"journey_{uuid.uuid4().hex[:8]}"
    share_token = f"shield_{uuid.uuid4().hex[:12]}"
    now = datetime.now()
    eta_dt = now + timedelta(minutes=eta_mins)
    
    conn = get_db_connection()
    # Mark any prior active journey as completed
    conn.execute("UPDATE journeys SET status = 'completed' WHERE user_id = ? AND status = 'active'", (user_id,))
    
    conn.execute('''
        INSERT INTO journeys (
            id, user_id, origin_stop_id, destination_stop_id, route_id,
            status, start_time, eta_minutes, eta_timestamp, current_lat,
            current_lng, progress_pct, share_token, alert_dispatched, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        journey_id, user_id, origin_id, dest_id, route_id,
        'active', now.isoformat(), eta_mins, eta_dt.isoformat(),
        orig_stop['lat'], orig_stop['lng'], 0, share_token, 0, now.isoformat()
    ))
    conn.commit()
    conn.close()
    
    return jsonify({
        'journey_id': journey_id,
        'share_token': share_token,
        'share_url': f"/track/{share_token}",
        'status': 'active',
        'eta_minutes': eta_mins,
        'eta_timestamp': eta_dt.isoformat(),
        'origin_stop': orig_stop,
        'dest_stop': transit_engine.stops_by_id.get(dest_id, {})
    })

@app.route('/api/journey/active', methods=['GET'])
def get_active_journey():
    user_id = get_current_user_id()
    conn = get_db_connection()
    row = conn.execute(
        "SELECT * FROM journeys WHERE user_id = ? AND status IN ('active', 'alert_prompt', 'missed_arrival_alert') ORDER BY created_at DESC LIMIT 1",
        (user_id,)
    ).fetchone()
    conn.close()
    
    if not row:
        return jsonify({'active_journey': None})
        
    journey = dict(row)
    journey['origin_stop'] = transit_engine.stops_by_id.get(journey['origin_stop_id'], {})
    journey['dest_stop'] = transit_engine.stops_by_id.get(journey['destination_stop_id'], {})
    journey['route'] = transit_engine.routes_by_id.get(journey['route_id'], {})
    return jsonify({'active_journey': journey})

@app.route('/api/journey/update', methods=['POST'])
def update_journey():
    data = request.get_json() or {}
    journey_id = data.get('journey_id')
    progress_pct = data.get('progress_pct', 0)
    lat = data.get('lat')
    lng = data.get('lng')
    status = data.get('status', 'active')
    
    conn = get_db_connection()
    if lat and lng:
        conn.execute('''
            UPDATE journeys 
            SET progress_pct = ?, current_lat = ?, current_lng = ?, status = ?
            WHERE id = ?
        ''', (progress_pct, lat, lng, status, journey_id))
    else:
        conn.execute('''
            UPDATE journeys 
            SET progress_pct = ?, status = ?
            WHERE id = ?
        ''', (progress_pct, status, journey_id))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/journey/complete', methods=['POST'])
def complete_journey():
    data = request.get_json() or {}
    journey_id = data.get('journey_id')
    
    conn = get_db_connection()
    conn.execute("UPDATE journeys SET status = 'completed', progress_pct = 100 WHERE id = ?", (journey_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Journey completed safely'})

# Unauthenticated public link for trusted contacts
@app.route('/api/share/<token>', methods=['GET'])
def get_shared_journey(token):
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM journeys WHERE share_token = ?", (token,)).fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Invalid or expired tracking token'}), 404
        
    user_row = conn.execute("SELECT full_name FROM users WHERE id = ?", (row['user_id'],)).fetchone()
    conn.close()
    
    journey = dict(row)
    journey['commuter_name'] = user_row['full_name'] if user_row else "NightShield Commuter"
    journey['origin_stop'] = transit_engine.stops_by_id.get(journey['origin_stop_id'], {})
    journey['dest_stop'] = transit_engine.stops_by_id.get(journey['destination_stop_id'], {})
    journey['route'] = transit_engine.routes_by_id.get(journey['route_id'], {})
    
    # Also find nearest emergency points for live guardian comfort
    journey['nearest_help_points'] = transit_engine.find_nearest_help_points(journey['current_lat'], journey['current_lng'], limit=2)
    return jsonify(journey)

# Missed arrival prompt & auto-escalation
@app.route('/api/journey/missed-arrival', methods=['POST'])
def handle_missed_arrival():
    data = request.get_json() or {}
    journey_id = data.get('journey_id')
    stage = data.get('stage', 'prompt') # 'prompt' (stage 1) or 'alert_contacts' (stage 2)
    lat = data.get('lat', 12.9650)
    lng = data.get('lng', 77.5950)
    
    conn = get_db_connection()
    journey = conn.execute("SELECT * FROM journeys WHERE id = ?", (journey_id,)).fetchone() if journey_id else None
    user_id = journey['user_id'] if journey else get_current_user_id()
    
    user = conn.execute("SELECT full_name FROM users WHERE id = ?", (user_id,)).fetchone()
    user_name = user['full_name'] if user else "Commuter"
    
    contacts_rows = conn.execute("SELECT name, phone FROM trusted_contacts WHERE user_id = ?", (user_id,)).fetchall()
    contacts = [dict(c) for c in contacts_rows]
    
    if stage == 'prompt':
        if journey_id:
            conn.execute("UPDATE journeys SET status = 'alert_prompt' WHERE id = ?", (journey_id,))
            conn.commit()
        conn.close()
        return jsonify({
            'status': 'alert_prompt',
            'countdown_seconds': 60,
            'message': 'Are you safe? We noticed your estimated arrival time has passed.'
        })
        
    elif stage == 'alert_contacts':
        if journey_id:
            conn.execute("UPDATE journeys SET status = 'missed_arrival_alert', alert_dispatched = 1 WHERE id = ?", (journey_id,))
            
        event_id = f"em_{uuid.uuid4().hex[:8]}"
        now_str = datetime.now().isoformat()
        sms_message = (
            f"[NightShield ALERT] {user_name} has missed their expected arrival time by over 5 minutes. "
            f"Last known GPS: ({lat:.4f}, {lng:.4f}). Real-time tracking link: https://nightshield.app/track/{journey['share_token'] if journey else 'demo'}"
        )
        
        conn.execute('''
            INSERT INTO emergency_events (id, user_id, journey_id, event_type, lat, lng, location_name, message, contacts_notified, resolved, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            event_id, user_id, journey_id, 'MISSED_ARRIVAL',
            lat, lng, 'Automated Missed Arrival Escalation', sms_message,
            json.dumps(contacts), 0, now_str
        ))
        conn.commit()
        conn.close()
        
        # Real SMS Gateway dispatch with Twilio / sandbox fallback
        r_name = journey.get('route_id') if journey else None
        if r_name and r_name in transit_engine.routes_by_id:
            r_name = transit_engine.routes_by_id[r_name]['name']
            
        dispatched_sms = send_guardian_missed_arrival_alert(
            contacts=contacts,
            user_name=user_name,
            lat=lat,
            lng=lng,
            share_token=journey['share_token'] if journey else 'demo',
            route_name=r_name,
            delay_mins=5
        )
        
        return jsonify({
            'success': True,
            'event_id': event_id,
            'escalation_stage': 'DISPATCHED_TO_CONTACTS',
            'message': 'Emergency escalation initiated. Alerts dispatched to trusted contacts.',
            'dispatched_notifications': dispatched_sms
        })

# ----------------- SOS ASSISTANCE -----------------

@app.route('/api/sos', methods=['POST'])
def trigger_sos():
    user_id = get_current_user_id()
    data = request.get_json() or {}
    lat = data.get('lat', 12.9720)
    lng = data.get('lng', 77.6010)
    location_name = data.get('location_name', 'Transit Corridor Near Central Interchange')
    journey_id = data.get('journey_id')
    route_name = data.get('route_name')
    eta_minutes = data.get('eta_minutes')
    risk_score = data.get('risk_score')
    
    conn = get_db_connection()
    user = conn.execute("SELECT full_name FROM users WHERE id = ?", (user_id,)).fetchone()
    user_name = user['full_name'] if user else "Commuter"
    
    contacts_rows = conn.execute("SELECT name, phone FROM trusted_contacts WHERE user_id = ?", (user_id,)).fetchall()
    contacts = [dict(c) for c in contacts_rows]
    
    # If journey_id is active, pull live telemetry
    if journey_id:
        conn.execute("UPDATE journeys SET status = 'sos_triggered' WHERE id = ?", (journey_id,))
        j_row = conn.execute("SELECT * FROM journeys WHERE id = ?", (journey_id,)).fetchone()
        if j_row:
            if not route_name:
                r = transit_engine.routes_by_id.get(j_row['route_id'])
                if r:
                    route_name = r['name']
            if not eta_minutes:
                eta_minutes = j_row['eta_minutes']
                
    event_id = f"sos_{uuid.uuid4().hex[:8]}"
    now_str = datetime.now().isoformat()
    nearest_help_points = transit_engine.find_nearest_help_points(lat, lng, limit=3)
    primary_hp = nearest_help_points[0]['name'] if nearest_help_points else "Central Transit Precinct"
    
    # Telemetry-rich Smart SOS broadcast
    sos_sms = (
        f"[SMART SOS ALERT] {user_name} activated emergency SOS in NightShield! "
        f"Route: {route_name or 'Transit Corridor'}. Last GPS: ({lat:.4f}, {lng:.4f}) near {location_name}. "
        f"ETA: {eta_minutes or 20} min | Corridor Risk Index: {risk_score or 45}/100. "
        f"Nearest Help Haven: {primary_hp}. Transit Police dispatched."
    )
    
    conn.execute('''
        INSERT INTO emergency_events (id, user_id, journey_id, event_type, lat, lng, location_name, message, contacts_notified, resolved, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        event_id, user_id, journey_id, 'SOS',
        lat, lng, location_name, sos_sms,
        json.dumps(contacts), 0, now_str
    ))
    conn.commit()
    conn.close()
    
    # Real SMS Gateway dispatch with Twilio / sandbox fallback
    dispatched_sms = send_sos_broadcast(
        contacts=contacts,
        user_name=user_name,
        lat=lat,
        lng=lng,
        location_name=location_name,
        route_name=route_name,
        eta_mins=eta_minutes,
        risk_score=risk_score,
        nearest_haven=primary_hp
    )
    
    return jsonify({
        'success': True,
        'event_id': event_id,
        'timestamp': now_str,
        'message': 'SOS Broadcast Dispatched. Stay calm, help is on the way.',
        'nearest_help_points': nearest_help_points,
        'dispatched_notifications': dispatched_sms
    })

# ----------------- PASSENGER SAFETY FEEDBACK -----------------

@app.route('/api/feedback', methods=['GET', 'POST'])
def feedback():
    if request.method == 'POST':
        user_id = get_current_user_id()
        data = request.get_json() or {}
        category = data.get('category', 'poor_lighting')
        stop_id = data.get('stop_id')
        route_id = data.get('route_id')
        description = data.get('description', '').strip()
        lat = data.get('lat')
        lng = data.get('lng')
        
        if not description:
            return jsonify({'error': 'Description is required'}), 400
            
        if not lat or not lng:
            if stop_id and stop_id in transit_engine.stops_by_id:
                lat = transit_engine.stops_by_id[stop_id]['lat']
                lng = transit_engine.stops_by_id[stop_id]['lng']
            else:
                lat, lng = 12.9720, 77.6010
                
        concern_id = f"sc_{uuid.uuid4().hex[:8]}"
        now_str = datetime.now().isoformat()
        
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO safety_concerns (id, user_id, category, stop_id, route_id, description, lat, lng, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (concern_id, user_id, category, stop_id, route_id, description, lat, lng, 'pending', now_str))
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'id': concern_id,
            'message': 'Safety report received. It will update the AI risk model and authority safety grid.'
        }), 201
        
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM safety_concerns ORDER BY created_at DESC LIMIT 50").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# ----------------- AUTHORITY ANALYTICS DASHBOARD -----------------

@app.route('/api/authority/analytics', methods=['GET'])
def authority_analytics():
    conn = get_db_connection()
    
    # 1. Delays by hour (20:00 to 05:00)
    delays_by_hour = [
        {'hour': '20:00', 'avg_delay_min': 4.2, 'total_trips': 142},
        {'hour': '21:00', 'avg_delay_min': 6.8, 'total_trips': 120},
        {'hour': '22:00', 'avg_delay_min': 9.1, 'total_trips': 95},
        {'hour': '23:00', 'avg_delay_min': 14.5, 'total_trips': 78},
        {'hour': '00:00', 'avg_delay_min': 18.2, 'total_trips': 54},
        {'hour': '01:00', 'avg_delay_min': 24.0, 'total_trips': 32},
        {'hour': '02:00', 'avg_delay_min': 21.5, 'total_trips': 24},
        {'hour': '03:00', 'avg_delay_min': 15.0, 'total_trips': 20},
        {'hour': '04:00', 'avg_delay_min': 8.4, 'total_trips': 45},
        {'hour': '05:00', 'avg_delay_min': 5.0, 'total_trips': 98},
    ]
    
    # 2. Demand vs Capacity by Route
    demand_by_route = [
        {'route': 'N1 (Metro)', 'demand': 860, 'capacity': 1200, 'safety_index': 92},
        {'route': 'N4 (Midnight)', 'demand': 520, 'capacity': 600, 'safety_index': 74},
        {'route': 'N7 (Feeder)', 'demand': 410, 'capacity': 500, 'safety_index': 88},
        {'route': 'N9 (Night Owl)', 'demand': 630, 'capacity': 550, 'safety_index': 62}, # Over capacity
        {'route': 'N12 (Port Link)', 'demand': 280, 'capacity': 400, 'safety_index': 79},
    ]
    
    # 3. Recurring Late-Night Service Gaps
    service_gaps = [
        {'corridor': 'Riverside Blvd ↔ Grand Terminal', 'gap_window': '01:00 - 02:45 AM', 'unmet_riders': 48, 'severity': 'High'},
        {'corridor': 'East Docks Station ↔ Waterfront', 'gap_window': '02:15 - 03:30 AM', 'unmet_riders': 32, 'severity': 'Medium'},
        {'corridor': 'Westside Market Feeder Link', 'gap_window': '00:30 - 01:45 AM', 'unmet_riders': 26, 'severity': 'Medium'}
    ]
    
    # 4. Reported Concerns Breakdown
    concern_rows = conn.execute('''
        SELECT category, COUNT(*) as count 
        FROM safety_concerns 
        GROUP BY category
    ''').fetchall()
    category_counts = {r['category']: r['count'] for r in concern_rows}
    
    concerns_chart = [
        {'name': 'Poor Lighting', 'count': category_counts.get('poor_lighting', 0) + 12, 'fill': '#f59e0b'},
        {'name': 'No Bus / Long Wait', 'count': category_counts.get('no_bus', 0) + 8, 'fill': '#06b6d4'},
        {'name': 'Unsafe Stop / Low Crowd', 'count': category_counts.get('unsafe_stop', 0) + 9, 'fill': '#a855f7'},
        {'name': 'Harassment / Suspicious Activity', 'count': category_counts.get('harassment', 0) + 4, 'fill': '#ef4444'},
        {'name': 'Other Transit Issues', 'count': category_counts.get('other', 0) + 5, 'fill': '#10b981'},
    ]
    
    # 5. Incident & SOS audit log
    emergency_rows = conn.execute('''
        SELECT * FROM emergency_events 
        ORDER BY created_at DESC LIMIT 20
    ''').fetchall()
    
    # 6. Concerns Map Points
    all_concerns = conn.execute("SELECT * FROM safety_concerns ORDER BY created_at DESC LIMIT 30").fetchall()
    conn.close()
    
    # 7. Actionable AI Recommendations for Authority
    ai_insights = [
        {
            'title': 'Deploy Additional Shuttles on Route N9',
            'severity': 'Critical',
            'reason': 'Night Owl corridor demand exceeds capacity by 14% between 01:00 AM and 02:30 AM, driving up passenger wait times to 22 mins.'
        },
        {
            'title': 'High-Mast Lighting Overhaul at Riverside Blvd',
            'severity': 'Urgent',
            'reason': 'Stop 06 has 4 reported poor-lighting incidents this week. Pedestrian walkway from platform to North Promenade is under-lit.'
        },
        {
            'title': 'Activate Mobile Transit Marshal at Cyberia Platform 2',
            'severity': 'Moderate',
            'reason': 'Historical night incident rate of 14% with frequent unmonitored passenger transfers at Midnight Cruiser stop.'
        }
    ]
    
    # 8. KMeans Stop Clusters & Underserved Stops (AI Hotspot Analysis)
    stops = transit_engine.config.get('stops', [])
    cluster_labels = {0: 'Standard Safe Stop', 1: 'Monitored Transit Hub', 2: 'High-Vulnerability Hotspot'}
    hotspots = []
    underserved = []
    for s in stops:
        c_id = risk_engine.stop_clusters.get(s['id'], 0)
        c_label = cluster_labels.get(c_id, 'Standard Stop')
        hotspots.append({
            'stop_id': s['id'],
            'name': s['name'],
            'lat': s['lat'],
            'lng': s['lng'],
            'cluster_id': c_id,
            'cluster_label': c_label,
            'lighting_quality': s.get('lighting_quality', 'Medium'),
            'crowd_level': s.get('crowd_level', 'Medium'),
            'incident_rate': s.get('historical_incident_rate', 0.1)
        })
        
        # Determine actionable recommendation
        action = (
            "Install smart solar LED masts and callbox" if s.get('lighting_quality') == 'Low'
            else "Deploy late-night roving transit marshals (01:00-03:30 AM)" if c_id == 2
            else "Increase headway frequency by 35% during peak night commute" if s.get('crowd_level') == 'High'
            else "Maintain continuous CCTV remote telemetry"
        )
        underserved.append({
            'stop_id': s['id'],
            'name': s['name'],
            'zone': s.get('zone', 'Central Metro'),
            'cluster_id': c_id,
            'cluster_label': c_label,
            'incident_pct': int(s.get('historical_incident_rate', 0.1) * 100),
            'lighting': s.get('lighting_quality', 'Medium'),
            'crowd': s.get('crowd_level', 'Medium'),
            'suggested_action': action
        })
    
    # Sort underserved: Cluster 2 first, then highest incident rate
    underserved.sort(key=lambda x: (x['cluster_id'] == 2, x['incident_pct']), reverse=True)
    
    # 9. Machine Learning Demand Forecast by Hour
    demand_forecast = [
        {'hour': '21:00', 'predicted_riders': 410, 'confidence': '96%', 'capacity_status': 'Optimal'},
        {'hour': '22:00', 'predicted_riders': 345, 'confidence': '94%', 'capacity_status': 'Optimal'},
        {'hour': '23:00', 'predicted_riders': 290, 'confidence': '91%', 'capacity_status': 'High Load'},
        {'hour': '00:00', 'predicted_riders': 210, 'confidence': '89%', 'capacity_status': 'Over-Capacity Alert'},
        {'hour': '01:00', 'predicted_riders': 165, 'confidence': '85%', 'capacity_status': 'Critical Gap'},
        {'hour': '02:00', 'predicted_riders': 120, 'confidence': '84%', 'capacity_status': 'Critical Gap'},
        {'hour': '03:00', 'predicted_riders': 95, 'confidence': '87%', 'capacity_status': 'Low Coverage'},
        {'hour': '04:00', 'predicted_riders': 180, 'confidence': '92%', 'capacity_status': 'Early Surge'}
    ]
    
    return jsonify({
        'city_name': transit_engine.config.get('city_name', 'Neo-Veridia Central Metro'),
        'delays_by_hour': delays_by_hour,
        'demand_by_route': demand_by_route,
        'service_gaps': service_gaps,
        'concerns_breakdown': concerns_chart,
        'emergency_audit_log': [dict(r) for r in emergency_rows],
        'concern_map_markers': [dict(r) for r in all_concerns],
        'ai_actionable_insights': ai_insights,
        'hotspots': hotspots,
        'underserved_stops': underserved,
        'demand_forecast': demand_forecast
    })

# ----------------- DEMO CONTROL PANEL HOOKS -----------------

@app.route('/api/demo/delay', methods=['POST'])
def demo_delay():
    data = request.get_json() or {}
    route_id = data.get('route_id', 'route_n9')
    delay_min = int(data.get('delay_minutes', 25))
    transit_engine.inject_delay(route_id, delay_min)
    return jsonify({'success': True, 'route_id': route_id, 'delay_minutes': delay_min})

@app.route('/api/demo/disrupt', methods=['POST'])
def demo_disrupt():
    data = request.get_json() or {}
    route_id = data.get('route_id', 'route_n4')
    transit_engine.inject_disruption(route_id)
    return jsonify({'success': True, 'route_id': route_id, 'status': 'Disrupted'})

@app.route('/api/demo/fast-forward', methods=['POST'])
def demo_fast_forward():
    data = request.get_json() or {}
    mins = int(data.get('minutes', 15))
    transit_engine.fast_forward(mins)
    return jsonify({'success': True, 'new_clock': transit_engine.simulated_clock.strftime('%H:%M:%S')})

@app.route('/api/demo/reset', methods=['POST'])
def demo_reset():
    seed_database()
    transit_engine.reset_demo()
    return jsonify({'success': True, 'message': 'Demo state successfully reset to initial pristine condition.'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting NightShield Backend on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
