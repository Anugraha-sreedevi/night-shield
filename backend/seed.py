import sqlite3
import uuid
from datetime import datetime, timedelta
from database import init_db, get_db_connection, hash_password

def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Check or Insert Demo User
    user_id = "user_demo_778"
    cursor.execute("SELECT id FROM users WHERE email = ?", ('user@nightshield.app',))
    existing_user = cursor.fetchone()
    
    now = datetime.now()
    if not existing_user:
        cursor.execute('''
            INSERT INTO users (id, email, password_hash, full_name, consent_location, consent_timestamp, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            'user@nightshield.app',
            hash_password('shield2026'),
            'Elena Rostova',
            1,
            (now - timedelta(days=5)).isoformat(),
            (now - timedelta(days=5)).isoformat()
        ))
    else:
        user_id = existing_user['id']

    # 2. Seed Trusted Contacts
    cursor.execute("DELETE FROM trusted_contacts WHERE user_id = ?", (user_id,))
    contacts = [
        ("tc_01", user_id, "Maya Lin", "+1 (555) 234-5678", "Sister", 1, now.isoformat()),
        ("tc_02", user_id, "David Miller", "+1 (555) 876-5432", "Parent", 0, now.isoformat()),
        ("tc_03", user_id, "Priya Sen", "+1 (555) 345-6789", "Roommate", 0, now.isoformat())
    ]
    cursor.executemany('''
        INSERT INTO trusted_contacts (id, user_id, name, phone, relation, is_primary, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', contacts)

    # 3. Seed Safety Concerns (Passenger feedback for Authority Dashboard)
    cursor.execute("DELETE FROM safety_concerns")
    concerns = [
        ("sc_01", user_id, "poor_lighting", "stop_06", "route_n9", "Flickering high-mast lights along Riverside promenade. Very dark walkway between stop and main road.", 12.9585, 77.5872, "pending", (now - timedelta(hours=2)).isoformat()),
        ("sc_02", user_id, "unsafe_stop", "stop_02", "route_n4", "Broken emergency call box near Cyberia Crossing platform 2. Isolated corner after midnight.", 12.9862, 77.5923, "investigating", (now - timedelta(hours=5)).isoformat()),
        ("sc_03", None, "no_bus", "stop_08", "route_n7", "Scheduled 23:30 feeder bus failed to arrive without announcement. Waited 35 mins alone.", 12.9741, 77.5724, "resolved", (now - timedelta(days=1, hours=3)).isoformat()),
        ("sc_04", None, "poor_lighting", "stop_10", "route_n4", "Streetlight cluster out of service leading into East Docks terminal pedestrian crossing.", 12.9765, 77.6322, "pending", (now - timedelta(days=1, hours=7)).isoformat()),
        ("sc_05", user_id, "harassment", "stop_06", "route_n9", "Group of loiterers harassing waiting passengers near pedestrian staircase.", 12.9581, 77.5868, "investigating", (now - timedelta(days=2)).isoformat()),
        ("sc_06", None, "other", "stop_04", "route_n1", "CCTV camera angle obstructed by newly erected advertising banner on Central Interchange upper concourse.", 12.9723, 77.6012, "resolved", (now - timedelta(days=3)).isoformat())
    ]
    cursor.executemany('''
        INSERT INTO safety_concerns (id, user_id, category, stop_id, route_id, description, lat, lng, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', concerns)

    # 4. Seed Emergency & Missed Arrival Events
    cursor.execute("DELETE FROM emergency_events")
    contacts_json = '[{"name": "Maya Lin", "phone": "+1 (555) 234-5678"}, {"name": "David Miller", "phone": "+1 (555) 876-5432"}]'
    events = [
        (
            "em_01",
            user_id,
            "journey_mock_01",
            "MISSED_ARRIVAL",
            12.9580,
            77.5870,
            "Riverside Blvd Corridor",
            "Automated Escalation: Passenger journey exceeded ETA by 12 mins with no arrival check-in. Coordinates dispatched.",
            contacts_json,
            1,
            (now - timedelta(days=1, hours=2)).isoformat()
        ),
        (
            "em_02",
            user_id,
            "journey_mock_02",
            "SOS",
            12.9740,
            77.5720,
            "Westside Market Arcade",
            "Direct SOS Pressed: Rapid emergency assistance requested. Nearest help point: Apollo 24x7 Chemist (410m).",
            contacts_json,
            1,
            (now - timedelta(days=3)).isoformat()
        )
    ]
    cursor.executemany('''
        INSERT INTO emergency_events (id, user_id, journey_id, event_type, lat, lng, location_name, message, contacts_notified, resolved, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', events)

    # 5. Seed Transit Ratings for Authority Dashboard
    cursor.execute("DELETE FROM transit_ratings")
    ratings = [
        ("tr_01", "route_n1", "stop_01", 5, 4, 5, "Well monitored train, security guard present on board.", (now - timedelta(days=1)).isoformat()),
        ("tr_02", "route_n1", "stop_04", 4, 4, 4, "Central Interchange was well illuminated.", (now - timedelta(days=1, hours=4)).isoformat()),
        ("tr_03", "route_n9", "stop_06", 2, 1, 2, "Riverside stop felt desolate, waited 22 minutes.", (now - timedelta(days=2)).isoformat()),
        ("tr_04", "route_n4", "stop_10", 2, 2, 2, "East docks needs more frequent patrols.", (now - timedelta(days=2, hours=3)).isoformat()),
        ("tr_05", "route_n7", "stop_07", 5, 3, 5, "University stop has great security and visibility.", (now - timedelta(days=3)).isoformat())
    ]
    cursor.executemany('''
        INSERT INTO transit_ratings (id, route_id, stop_id, safety_rating, crowd_rating, lighting_rating, comments, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', ratings)

    conn.commit()
    conn.close()
    print("Database successfully seeded with demo user, trusted contacts, safety concerns, and historical events.")

if __name__ == '__main__':
    seed_database()
