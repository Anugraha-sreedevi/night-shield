"""
NightShield - SMS Dispatch Verification Tool
Usage:
    python test_sms_dispatch.py [phone_number]
Example:
    python test_sms_dispatch.py +15551234567
"""

import sys
import os
from datetime import datetime

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sms_service import (
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER,
    twilio_configured,
    send_single_sms,
    normalize_phone_number
)

def run_test():
    print("=" * 65)
    print("[NightShield] Emergency SMS Gateway Verification Test")
    print("=" * 65)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 65)

    # 1. Inspect Environment Variables
    print("[1] Checking Twilio Configuration Environment:")
    if TWILIO_ACCOUNT_SID:
        masked_sid = TWILIO_ACCOUNT_SID[:6] + "..." + TWILIO_ACCOUNT_SID[-4:]
        print(f"    [OK] TWILIO_ACCOUNT_SID:  {masked_sid}")
    else:
        print("    [--] TWILIO_ACCOUNT_SID:  Not configured (see .env.example)")

    if TWILIO_AUTH_TOKEN:
        masked_token = TWILIO_AUTH_TOKEN[:4] + "..." + TWILIO_AUTH_TOKEN[-2:]
        print(f"    [OK] TWILIO_AUTH_TOKEN:   {masked_token}")
    else:
        print("    [--] TWILIO_AUTH_TOKEN:   Not configured (see .env.example)")

    if TWILIO_PHONE_NUMBER:
        print(f"    [OK] TWILIO_PHONE_NUMBER: {TWILIO_PHONE_NUMBER}")
    else:
        print("    [--] TWILIO_PHONE_NUMBER: Not configured (see .env.example)")

    if twilio_configured:
        print("\n    >>> STATUS: Twilio Live Cellular Dispatch ACTIVE.")
    else:
        print("\n    >>> STATUS: Operating in Transparent Sandbox Mode.")
        print("        To activate live cellular delivery to physical phones:")
        print("        1. Copy backend/.env.example to backend/.env")
        print("        2. Fill in your Twilio Account SID, Auth Token & Twilio Phone Number.")

    print("-" * 65)

    # 2. Destination Phone Number
    if len(sys.argv) > 1:
        test_phone = sys.argv[1].strip()
    else:
        test_phone = "+1 (555) 234-5678"
        print(f"[*] No phone number supplied in CLI args. Using test target: {test_phone}")
        print("    (Pass your real mobile number to test live cellular: python test_sms_dispatch.py +1XXXXXXXXXX)")

    norm = normalize_phone_number(test_phone)
    print(f"[*] Sanitized E.164 destination: {norm}")

    # 3. Test Message Payload
    test_message = (
        f"[NightShield TEST] Emergency watchdog dispatch verification at {datetime.now().strftime('%H:%M:%S')}. "
        f"Location: North Tech Hub Station (12.9980, 77.5850). Live track: https://nightshield.app/track/test_demo"
    )

    print("\n[3] Dispatching Verification Payload:")
    print(f"    Message Body:\n    \"{test_message}\"")
    print("-" * 65)

    # 4. Trigger Dispatch
    res = send_single_sms(test_phone, test_message, recipient_name="Primary Guardian")

    print("[4] Dispatch Result Received:")
    print(f"    Recipient:       {res['recipient_name']} ({res['recipient_phone']})")
    print(f"    Delivery Status: {res['status']}")
    print(f"    Success:         {res['success']}")
    print(f"    Live Gateway:    {res['is_live_gateway']}")
    print(f"    Message SID:     {res['message_sid']}")
    
    if res.get('error_detail'):
        print(f"    Error Detail:    {res['error_detail']}")

    print("=" * 65)
    if res['success']:
        print("[SUCCESS] NightShield SMS dispatch pipeline verified successfully.")
    else:
        print("[FAILED] Delivery failed. Review error detail above.")
    print("=" * 65)

if __name__ == '__main__':
    run_test()
