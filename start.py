import subprocess
import sys
import os
import time
import signal

def run_nightshield():
    print("=" * 65)
    print(" 🛡️  NightShield: Late-Night Journey Safety Companion")
    print("     Team: HarvestHub | Problem ID: SC-03")
    print("     Tagline: 'Safer Journeys | Smarter Transport'")
    print("=" * 65)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend")

    # 1. Start Backend Flask API
    print("\n[1/2] 🚀 Launching NightShield Flask API on http://127.0.0.1:5000...")
    backend_process = subprocess.Popen(
        [sys.executable, "app.py"],
        cwd=backend_dir,
        shell=False
    )

    time.sleep(2)

    # 2. Start Frontend Vite Dev Server
    print("[2/2] ⚡ Launching NightShield React Frontend on http://localhost:5173...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_process = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir,
        shell=False
    )

    print("\n" + "=" * 65)
    print(" ✅ NightShield is now fully RUNNING!")
    print(" 🌐 Commuter App:    http://localhost:5173")
    print(" 📊 Authority Portal: http://localhost:5173/authority")
    print(" 📡 Backend REST API: http://127.0.0.1:5000/api/stops")
    print("=" * 65)
    print(" Press Ctrl+C at any time to gracefully terminate both services.\n")

    def handle_shutdown(signum, frame):
        print("\n🛑 Shutting down NightShield services...")
        backend_process.terminate()
        frontend_process.terminate()
        backend_process.wait()
        frontend_process.wait()
        print("Done. Stay safe!")
        sys.exit(0)

    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        handle_shutdown(None, None)

if __name__ == "__main__":
    run_nightshield()
