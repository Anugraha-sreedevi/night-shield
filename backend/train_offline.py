import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.cluster import KMeans

def compute_hour_risk_weight(hour):
    if 1 <= hour <= 3:
        return 2.8
    elif hour in [0, 4]:
        return 2.1
    elif hour in [23, 5]:
        return 1.6
    return 1.0

def train_offline():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, 'data')
    config_path = os.path.join(data_dir, 'city_config.json')
    csv_path = os.path.join(data_dir, 'historical_night_commutes.csv')
    bundle_path = os.path.join(data_dir, 'models_bundle.joblib')

    with open(config_path, 'r', encoding='utf-8') as f:
        city_config = json.load(f)

    print(f"Loading data from {csv_path}...")
    df = pd.read_csv(csv_path)

    # Feature engineering for classifier
    hour_weights = [compute_hour_risk_weight(h) for h in df['hour_of_night']]
    routes_dict = {r['id']: r for r in city_config.get('routes', [])}
    freqs = [routes_dict.get(r_id, {}).get('frequency_min', 20) for r_id in df['route_id']]

    X = pd.DataFrame({
        'hour_risk_weight': hour_weights,
        'delay_minutes': df['delay_mins'],
        'crowd_level_code': df['crowd_level'],
        'route_frequency_min': freqs,
        'stop_incident_rate': df['stop_incident_rate'],
        'lighting_code': df['lighting_quality'],
        'reported_concerns_cnt': df['incident_reports_count']
    })
    y_risk = df['risk_label']

    print("Fitting RandomForestClassifier...")
    risk_classifier = RandomForestClassifier(n_estimators=100, max_depth=6, random_state=42)
    risk_classifier.fit(X, y_risk)

    print("Fitting GradientBoostingRegressor...")
    X_delay = pd.DataFrame({
        'hour_risk_weight': hour_weights,
        'route_frequency_min': freqs,
        'crowd_level_code': df['crowd_level'],
        'lighting_code': df['lighting_quality'],
        'stop_incident_rate': df['stop_incident_rate']
    })
    y_delay = df['delay_mins']
    delay_regressor = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
    delay_regressor.fit(X_delay, y_delay)

    print("Fitting KMeans for safety hotspots...")
    hotspot_kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    stops = city_config.get('stops', [])
    stop_features = []
    for s in stops:
        crowd = 0 if s.get('crowd_level') == 'Low' else 1 if s.get('crowd_level') == 'Medium' else 2
        lighting = 0 if s.get('lighting_quality') == 'Low' else 1 if s.get('lighting_quality') == 'Medium' else 2
        incident_rate = s.get('historical_incident_rate', 0.1)
        stop_features.append([incident_rate * 10, 2 - crowd, 2 - lighting])

    clusters = hotspot_kmeans.fit_predict(stop_features)
    stop_clusters = {}
    for s, cluster_id in zip(stops, clusters):
        stop_clusters[s['id']] = int(cluster_id)

    bundle = {
        'risk_classifier': risk_classifier,
        'delay_regressor': delay_regressor,
        'hotspot_kmeans': hotspot_kmeans,
        'stop_clusters': stop_clusters,
    }

    joblib.dump(bundle, bundle_path)
    print(f"SUCCESS: Models bundle saved offline to {bundle_path} ({os.path.getsize(bundle_path)} bytes).")

if __name__ == '__main__':
    train_offline()
