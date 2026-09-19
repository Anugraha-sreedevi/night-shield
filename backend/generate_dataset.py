import numpy as np
import pandas as pd
import json
import os

def generate_commute_dataset():
    print("Generating synthetic historical night commute dataset...")
    np.random.seed(42)
    n_samples = 2500

    base_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(base_dir, 'data', 'city_config.json')
    
    with open(config_path, 'r', encoding='utf-8') as f:
        city_config = json.load(f)

    stops = city_config.get('stops', [])
    routes = city_config.get('routes', [])
    stop_ids = [s['id'] for s in stops]
    route_ids = [r['id'] for r in routes]

    stop_crowd_map = {'Low': 0, 'Medium': 1, 'High': 2}
    stop_light_map = {'Low': 0, 'Medium': 1, 'High': 2}
    stop_metadata = {s['id']: s for s in stops}
    route_metadata = {r['id']: r for r in routes}

    hours = np.random.choice([21, 22, 23, 0, 1, 2, 3, 4, 5], size=n_samples, p=[0.14, 0.16, 0.18, 0.16, 0.12, 0.08, 0.06, 0.05, 0.05])
    assigned_routes = np.random.choice(route_ids, size=n_samples)
    
    assigned_stops = []
    for r_id in assigned_routes:
        r_stops = route_metadata[r_id]['stops']
        assigned_stops.append(np.random.choice(r_stops))
        
    crowd_levels = []
    lighting_levels = []
    incident_rates = []
    route_frequencies = []

    for s_id, r_id in zip(assigned_stops, assigned_routes):
        s = stop_metadata[s_id]
        r = route_metadata[r_id]
        crowd_levels.append(stop_crowd_map.get(s.get('crowd_level', 'Medium'), 1))
        lighting_levels.append(stop_light_map.get(s.get('lighting_quality', 'Medium'), 1))
        incident_rates.append(s.get('historical_incident_rate', 0.1))
        route_frequencies.append(r.get('frequency_min', 20))

    crowd_levels = np.array(crowd_levels)
    lighting_levels = np.array(lighting_levels)
    incident_rates = np.array(incident_rates)
    route_frequencies = np.array(route_frequencies)

    # Delay modeling with realistic late-night peak around 1 AM
    hour_delay_factor = np.array([2.4 if 1 <= h <= 3 else 1.6 if h in [0, 23] else 1.0 for h in hours])
    delay_mins = np.random.exponential(scale=6.5, size=n_samples) * hour_delay_factor
    delay_mins = np.clip(np.round(delay_mins, 1), 0, 48)

    # Wait time modeling based on frequency + delay
    wait_time_mins = (route_frequencies * np.random.uniform(0.3, 0.9, size=n_samples)) + (delay_mins * 0.4)
    wait_time_mins = np.clip(np.round(wait_time_mins, 1), 2, 60)

    # Passenger incident reports Poisson distribution
    incident_reports_count = np.random.poisson(lam=incident_rates * 6.0)

    # Calculated composite ground truth risk score (0-100)
    hour_isolation_weight = np.array([2.8 if 1 <= h <= 4 else 1.8 if h in [0, 23] else 1.0 for h in hours])
    actual_risk_score = (
        (hour_isolation_weight - 1.0) * 16.0 +
        (delay_mins / 48.0) * 25.0 +
        (wait_time_mins / 60.0) * 15.0 +
        (2 - crowd_levels) * 12.0 +
        (2 - lighting_levels) * 14.0 +
        (incident_rates * 45.0) +
        (incident_reports_count * 3.5)
    )
    actual_risk_score += np.random.normal(0, 3.5, size=n_samples)
    actual_risk_score = np.clip(np.round(actual_risk_score), 5, 96)

    # Labels: 0 (Low: < 35), 1 (Medium: 35-65), 2 (High: >= 65)
    risk_labels = np.zeros(n_samples, dtype=int)
    risk_labels[(actual_risk_score >= 35) & (actual_risk_score < 65)] = 1
    risk_labels[actual_risk_score >= 65] = 2

    df = pd.DataFrame({
        'route_id': assigned_routes,
        'stop_id': assigned_stops,
        'hour_of_night': hours,
        'wait_time_mins': wait_time_mins,
        'delay_mins': delay_mins,
        'crowd_level': crowd_levels,
        'lighting_quality': lighting_levels,
        'stop_incident_rate': np.round(incident_rates, 3),
        'incident_reports_count': incident_reports_count,
        'actual_risk_score': actual_risk_score.astype(int),
        'risk_label': risk_labels
    })

    out_dir = os.path.join(base_dir, 'data')
    os.makedirs(out_dir, exist_ok=True)
    out_csv = os.path.join(out_dir, 'historical_night_commutes.csv')
    df.to_csv(out_csv, index=False)
    print(f"Generated {len(df)} records in {out_csv}")
    return out_csv

if __name__ == '__main__':
    generate_commute_dataset()
