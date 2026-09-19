# 🛡️ NightShield: Late-Night Journey Safety Companion
> **Safer Journeys | Smarter Transport**  
> *Team HarvestHub — Problem ID: SC-03*

NightShield is a late-night public transport safety companion web app engineered for solo night commuters, transit operators, and emergency responders. It pairs predictive AI safety scoring with live journey tracking, sudden-stop and deviation detection, automated escalation alerts, Twilio SMS dispatch, and a unified dark/light mode interface.

---

## ✨ Features

- **🌙 Dark Mode & Light Mode**: Built-in toggle supporting dark and light themes across all components and map layers with persistent preference storage.
- **🧠 Predictive AI Safety Engine**:
  - **Risk Classifier**: Multi-factor 0–100 risk score based on lighting, crowd density, time of night, and incident history.
  - **Delay Forecaster**: Machine-learning regression predicting stop-level transit wait times and delays.
  - **Hotspot Clustering**: KMeans clustering identifying safety hotspots across urban transport nodes.
- **🛰️ Active Journey Watchdog**:
  - Real-time ETA and missed-arrival detection.
  - Automated 3-stage escalation:
    1. **Stage 1**: In-app safety check-in prompt with audio chime.
    2. **Stage 2**: Automated Guardian SMS dispatch with GPS coordinates and live tracking link.
    3. **Stage 3**: SOS broadcast to emergency contacts & transport dispatch.
  - Off-route diversion & sudden-stop anomaly detection.
- **📱 Twilio SMS Integration**:
  - Live guardian notifications and SOS broadcast via Twilio SMS API with E.164 phone formatting and automated fallback.
- **🗺️ Interactive Map & Routes**:
  - Real-time vehicle location, route path, lighted safety zones, and transit stops.
- **👮 Authority & Operator Dashboard**:
  - Real-time fleet tracking, SOS alert feed, incident resolution, and crowd analytics.
- **💬 NightShield Safety Companion**:
  - Conversational AI assistant providing situational awareness, station lighting status, and safe waiting suggestions.
- **📲 Mobile-First PWA**:
  - Installable Progressive Web App with manifest and service worker.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Leaflet / React-Leaflet
- **Backend**: Python Flask, SQLite, Scikit-Learn, Pandas, NumPy, Twilio Python SDK, Python-Dotenv
- **Platform**: Cross-platform (Windows / macOS / Linux)

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)

### 2. Run Locally with One Command

#### Windows:
```bash
run.bat
```
or
```bash
python start.py
```

This script will automatically:
1. Initialize the Python virtual environment and install backend requirements.
2. Generate the synthetic commute dataset and train the Scikit-learn AI models.
3. Seed the SQLite database with routes, stops, and historical safety metrics.
4. Install frontend dependencies and launch both the Flask backend (`http://localhost:5000`) and Vite frontend (`http://localhost:5173`).

---

## ⚙️ Configuration & Twilio SMS

NightShield operates out-of-the-box in simulated mode without requiring any paid API keys.

To enable live SMS alerts:
1. Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Fill in your Twilio credentials:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```
3. Restart the backend server. The app will automatically validate phone numbers and dispatch live SMS alerts during Stage 2 check-ins and Stage 3 SOS broadcasts.

---

## 📁 Project Structure

```
Night-Shield/
├── backend/
│   ├── app.py                     # Flask REST API server
│   ├── database.py                # SQLite schema and query interface
│   ├── generate_dataset.py        # Synthetic commuter dataset generator
│   ├── risk_model.py              # Scikit-learn ML models (Risk, Delay, Hotspots)
│   ├── seed.py                    # Database seeder with city transit configuration
│   ├── sms_service.py             # Twilio SMS dispatch and fallback handler
│   ├── test_sms_dispatch.py       # SMS test runner
│   ├── transit_engine.py          # Transit simulation and routing logic
│   ├── requirements.txt           # Python dependencies
│   ├── .env.example               # Template environment configuration
│   └── data/
│       ├── city_config.json       # Transit routes, stops, and lighting configs
│       └── historical_night_commutes.csv
├── frontend/
│   ├── src/
│   │   ├── api/client.js          # Backend API client with offline fallback
│   │   ├── components/            # TopHeader (Dark/Light toggle), MapView, SOSModal, etc.
│   │   ├── context/AppContext.jsx # Global state (Theme, Journey, Watchdog, Contacts)
│   │   ├── views/                 # Dashboard, PlanJourney, LiveJourney, Authority, etc.
│   │   ├── mockData.js            # Offline simulation data
│   │   └── index.css              # Custom design system tokens & dark mode overrides
│   ├── public/                    # PWA manifest, service worker, icons
│   ├── package.json
│   └── tailwind.config.js
├── package.json
├── run.bat
├── start.py
└── README.md
```

---

## 🔒 Security & Privacy

- Location sharing is active only during an initiated journey.
- Sensitive environment variables (`.env`) are excluded from version control.
- End-to-end user data isolation with local device persistence for trusted contacts.

---

## 📄 License

MIT License. Developed with pride by Team **HarvestHub**.
