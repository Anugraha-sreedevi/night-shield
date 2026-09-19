import sqlite3
import os
import hashlib
import json
from datetime import datetime

import shutil

def get_db_path():
    # If running in Vercel, serverless, or read-only filesystem, use /tmp
    if os.environ.get('VERCEL') or not os.access(os.path.dirname(__file__), os.W_OK):
        tmp_db = os.path.join('/tmp', 'night_shield.db')
        src_db = os.path.join(os.path.dirname(__file__), 'night_shield.db')
        if not os.path.exists(tmp_db) and os.path.exists(src_db):
            try:
                shutil.copy2(src_db, tmp_db)
            except Exception as e:
                print(f"Notice: Failed to copy template DB to /tmp: {e}")
        return tmp_db
    return os.path.join(os.path.dirname(__file__), 'night_shield.db')

def get_db_connection():
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    # Deterministic salt for demo reproducibility
    salt = "nightshield_cyber_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT NOT NULL,
        consent_location INTEGER DEFAULT 1,
        consent_timestamp TEXT,
        created_at TEXT NOT NULL
    )
    ''')
    
    # Trusted Contacts table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS trusted_contacts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        relation TEXT NOT NULL,
        is_primary INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Active / Past Journeys table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS journeys (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        origin_stop_id TEXT NOT NULL,
        destination_stop_id TEXT NOT NULL,
        route_id TEXT NOT NULL,
        status TEXT NOT NULL, -- 'active', 'completed', 'alert_prompt', 'missed_arrival_alert', 'sos_triggered'
        start_time TEXT NOT NULL,
        eta_minutes INTEGER NOT NULL,
        eta_timestamp TEXT NOT NULL,
        current_lat REAL NOT NULL,
        current_lng REAL NOT NULL,
        progress_pct INTEGER DEFAULT 0,
        share_token TEXT UNIQUE NOT NULL,
        alert_dispatched INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')
    
    # Safety Concerns table (Passenger feedback)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS safety_concerns (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        category TEXT NOT NULL, -- 'poor_lighting', 'no_bus', 'unsafe_stop', 'harassment', 'other'
        stop_id TEXT,
        route_id TEXT,
        description TEXT NOT NULL,
        lat REAL,
        lng REAL,
        status TEXT DEFAULT 'pending', -- 'pending', 'investigating', 'resolved'
        created_at TEXT NOT NULL
    )
    ''')
    
    # Emergency / SOS & Missed Arrival Events
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS emergency_events (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        journey_id TEXT,
        event_type TEXT NOT NULL, -- 'SOS', 'MISSED_ARRIVAL', 'SAFETY_CHECK_TIMEOUT'
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        location_name TEXT,
        message TEXT NOT NULL,
        contacts_notified TEXT NOT NULL, -- JSON array string of contacts
        resolved INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Transit feedback / rating records
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transit_ratings (
        id TEXT PRIMARY KEY,
        route_id TEXT NOT NULL,
        stop_id TEXT,
        safety_rating INTEGER NOT NULL, -- 1 to 5
        crowd_rating INTEGER NOT NULL,
        lighting_rating INTEGER NOT NULL,
        comments TEXT,
        created_at TEXT NOT NULL
    )
    ''')
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Database schema successfully initialized.")
