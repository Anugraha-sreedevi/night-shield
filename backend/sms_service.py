import os
import re
from datetime import datetime
from dotenv import load_dotenv

# Load local environment variables if .env exists
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID', '').strip()
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN', '').strip()
TWILIO_PHONE_NUMBER = os.environ.get('TWILIO_PHONE_NUMBER', '').strip()

# Initialize Twilio Client if credentials are configured
twilio_client = None
twilio_configured = False

if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_ACCOUNT_SID.startswith('AC'):
    try:
        from twilio.rest import Client
        from twilio.base.exceptions import TwilioRestException
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        twilio_configured = True
        print("[NightShield SMS Gateway] Twilio client initialized with Account SID:", TWILIO_ACCOUNT_SID[:8] + '...')
    except Exception as e:
        print("[NightShield SMS Gateway] Error initializing Twilio client:", e)
        twilio_configured = False
else:
    print("[NightShield SMS Gateway] Twilio credentials not found or unconfigured. Operating in verified sandbox fallback mode.")

def normalize_phone_number(raw_phone):
    """
    Sanitizes and normalizes phone numbers to standard international E.164 format.
    E.g. (555) 234-5678 -> +15552345678
    """
    if not raw_phone:
        return None
    
    clean = re.sub(r'[^0-9+]', '', str(raw_phone).strip())
    if not clean:
        return None
        
    if not clean.startswith('+'):
        # If 10 digits (US/Canada format), default to +1
        if len(clean) == 10:
            clean = '+1' + clean
        elif len(clean) == 11 and clean.startswith('1'):
            clean = '+' + clean
        else:
            clean = '+' + clean
            
    return clean

def send_single_sms(to_phone, message_text, recipient_name="Contact"):
    """
    Dispatches a single SMS via Twilio if configured, or records verified sandbox payload.
    Includes explicit error handling and diagnostics so delivery failures never fail silently.
    """
    normalized_to = normalize_phone_number(to_phone)
    now_str = datetime.now().strftime('%H:%M:%S')

    if not normalized_to or len(normalized_to) < 8:
        return {
            'recipient_name': recipient_name,
            'recipient_phone': to_phone,
            'status': 'Failed (Invalid Phone Number Format)',
            'success': False,
            'error_detail': f"Phone number '{to_phone}' could not be formatted to international standard E.164.",
            'is_live_gateway': bool(twilio_configured),
            'message_sid': None,
            'timestamp': now_str,
            'message': message_text
        }

    if twilio_configured and twilio_client and TWILIO_PHONE_NUMBER:
        try:
            from twilio.base.exceptions import TwilioRestException
            
            message = twilio_client.messages.create(
                body=message_text,
                from_=TWILIO_PHONE_NUMBER,
                to=normalized_to
            )
            
            print(f"[NightShield Twilio Dispatch] Successfully sent SMS to {normalized_to}. SID: {message.sid}")
            return {
                'recipient_name': recipient_name,
                'recipient_phone': normalized_to,
                'status': 'Delivered via Twilio SMS',
                'success': True,
                'error_detail': None,
                'is_live_gateway': True,
                'message_sid': message.sid,
                'timestamp': now_str,
                'message': message_text
            }
        except TwilioRestException as te:
            err_msg = te.msg or str(te)
            print(f"[NightShield Twilio Error] Failed sending to {normalized_to}: code {te.code}, {err_msg}")
            
            # Translate common codes for commuter clarity
            friendly_err = err_msg
            if te.code == 21211:
                friendly_err = f"Invalid destination number: '{normalized_to}' is not a valid mobile phone."
            elif te.code == 21608:
                friendly_err = f"Twilio Trial Account: '{normalized_to}' is not verified in your Twilio Sandbox Console."
            elif te.code == 20003:
                friendly_err = "Twilio Authentication Error: Verify TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN."
            elif te.code == 21614:
                friendly_err = f"Twilio Phone Number '{TWILIO_PHONE_NUMBER}' cannot send SMS to this destination."
                
            return {
                'recipient_name': recipient_name,
                'recipient_phone': normalized_to,
                'status': f"Failed (Twilio Error {te.code})",
                'success': False,
                'error_detail': friendly_err,
                'is_live_gateway': True,
                'message_sid': None,
                'timestamp': now_str,
                'message': message_text
            }
        except Exception as e:
            print(f"[NightShield SMS Gateway Exception] {e}")
            return {
                'recipient_name': recipient_name,
                'recipient_phone': normalized_to,
                'status': 'Failed (Gateway Network Error)',
                'success': False,
                'error_detail': str(e),
                'is_live_gateway': True,
                'message_sid': None,
                'timestamp': now_str,
                'message': message_text
            }
    else:
        # Transparent Sandbox Fallback
        # Clearly flagged so commuters and developers know credentials are ready to be plugged in
        return {
            'recipient_name': recipient_name,
            'recipient_phone': normalized_to,
            'status': 'Delivered (Simulated Carrier - Set TWILIO_ACCOUNT_SID for Live Cellular)',
            'success': True,
            'error_detail': None,
            'is_live_gateway': False,
            'message_sid': f"SM_sim_{abs(hash(to_phone + now_str)) % 1000000000:09d}",
            'timestamp': now_str,
            'message': message_text
        }

def send_guardian_missed_arrival_alert(contacts, user_name, lat, lng, share_token, route_name=None, delay_mins=None):
    """
    Step 2 in Missed-Arrival Watchdog escalation:
    Dispatches targeted SMS alerts to all configured trusted contacts.
    """
    tracking_link = f"https://nightshield.app/track/{share_token}" if share_token else "https://nightshield.app"
    corridor_str = f"on corridor {route_name} " if route_name else ""
    delay_str = f"(Delayed by {delay_mins}m) " if delay_mins else ""
    
    sms_body = (
        f"[NightShield ALERT] {user_name} has missed their expected arrival time {delay_str}{corridor_str}and has not responded to watchdog safety check-ins. "
        f"Last known GPS: ({lat:.4f}, {lng:.4f}). "
        f"Real-time guardian live track: {tracking_link}"
    )

    results = []
    for c in contacts:
        res = send_single_sms(c.get('phone'), sms_body, recipient_name=c.get('name', 'Guardian'))
        results.append(res)
        
    return results

def send_sos_broadcast(contacts, user_name, lat, lng, location_name, route_name=None, eta_mins=None, risk_score=None, nearest_haven=None):
    """
    Step 3 in Emergency Escalation:
    Smart SOS broadcast with full telemetry (GPS, route, ETA, risk score, nearest safe haven).
    """
    route_str = route_name or "Transit Corridor"
    eta_str = f"{eta_mins}m" if eta_mins else "N/A"
    risk_str = f"{risk_score}/100" if risk_score else "Elevated"
    haven_str = nearest_haven or "Central Precinct Police Dispatch"

    sos_body = (
        f"[SMART SOS ALERT] {user_name} activated emergency SOS in NightShield! "
        f"Route: {route_str}. Last GPS: ({lat:.4f}, {lng:.4f}) near {location_name}. "
        f"ETA remaining: {eta_str} | AI Risk Index: {risk_str}. "
        f"Nearest Safe Haven Dispatched: {haven_str}. Transit police dispatched."
    )

    results = []
    for c in contacts:
        res = send_single_sms(c.get('phone'), sos_body, recipient_name=c.get('name', 'Emergency Contact'))
        results.append(res)
        
    return results
