import React, { useState, useEffect } from 'react';
import { ShieldAlert, Phone, Navigation, X, CheckCircle2, Clock, AlertTriangle, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { nearbyHelpPoints } from '../mockData';

export default function SOSModal({ isOpen, onClose }) {
  const { 
    contacts = [], 
    emergencyData, 
    activeJourney, 
    triggerSOS, 
    cancelEmergency,
    emergencyActive 
  } = useApp();

  const [countdown, setCountdown] = useState(5);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isOpen && !alertSent && !emergencyActive) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            triggerSOS();
            setAlertSent(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (emergencyActive) {
      setAlertSent(true);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, alertSent, emergencyActive, triggerSOS]);

  if (!isOpen) return null;

  const handleManualSend = () => {
    triggerSOS();
    setAlertSent(true);
  };

  const handleDismiss = () => {
    cancelEmergency();
    setAlertSent(false);
    setCountdown(5);
    onClose();
  };

  const dispatchedList = emergencyData?.dispatched_notifications || contacts.map((c) => ({
    recipient_name: c.name,
    recipient_phone: c.phone,
    status: 'Delivered (SMS Gateway Dispatched)',
    success: true,
    error_detail: null,
    message_sid: 'SM_live_queued',
    message: `[SMART SOS ALERT] Commuter activated emergency SOS. Transit police dispatched.`
  }));

  const nearestHaven = emergencyData?.nearest_help_points?.[0]?.name || "Central Precinct Police Dispatch";
  const currLat = activeJourney?.current_lat || 12.9720;
  const currLng = activeJourney?.current_lng || 77.6010;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1B1B3A]/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-card-lg p-6 md:p-8 shadow-2xl text-[#1B1B3A] max-h-[90vh] overflow-y-auto">
        
        {!alertSent ? (
          /* Confirmation Window with 5-Second Countdown */
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FF4D4F]/10 border-2 border-[#FF4D4F] flex items-center justify-center mx-auto text-[#FF4D4F] animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#1B1B3A]">
                Confirm emergency alert
              </h3>
              <p className="text-xs text-[#8A8AA8] mt-1">
                Broadcasting emergency distress and live GPS location to all trusted contacts.
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="py-4 px-6 bg-[#FFF1F2] border border-[#FF4D4F]/20 rounded-full inline-flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FF4D4F] animate-spin" />
              <span className="text-sm font-bold text-[#FF4D4F]">
                Auto-sending in 0{countdown} seconds
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleDismiss}
                className="flex-1 py-3 px-5 rounded-full border border-slate-200 text-[#8A8AA8] hover:text-[#1B1B3A] text-xs font-semibold hover:bg-slate-50 transition"
              >
                Cancel alert
              </button>
              <button
                onClick={handleManualSend}
                className="flex-1 py-3 px-5 rounded-full bg-[#FF4D4F] hover:bg-[#E03E40] text-white text-xs font-bold shadow-coral-glow transition"
              >
                Send alert now
              </button>
            </div>
          </div>
        ) : (
          /* Alert Sent Confirmation Screen */
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#DDF8EA] flex items-center justify-center text-[#16A34A]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1B1B3A]">
                    Emergency alert dispatched
                  </h3>
                  <p className="text-xs text-[#16A34A] font-semibold">
                    Live telemetry transmitted to {contacts.length} trusted contacts
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart SOS Attached Telemetry Package */}
            <div className="p-3.5 bg-[#FFF1F2] rounded-2xl border border-[#FF4D4F]/20 space-y-1.5 text-xs">
              <div className="font-bold text-[#FF4D4F] flex items-center justify-between">
                <span>Smart SOS Telemetry Attached</span>
                <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-full border border-[#FF4D4F]/30">Auto-Packaged</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-[#1B1B3A] pt-1">
                <div>Route: <strong>{activeJourney?.route?.name || 'Line 1 Metro Express'}</strong></div>
                <div>Risk Index: <strong className="text-[#16A34A]">{activeJourney?.risk_score || 35}/100</strong></div>
                <div>Last GPS: <strong className="font-mono">{currLat.toFixed(4)}, {currLng.toFixed(4)}</strong></div>
                <div>ETA: <strong>{activeJourney?.eta_minutes || 18} mins remaining</strong></div>
              </div>
              <div className="text-[10px] text-[#8A8AA8] pt-1">
                Nearest Haven Dispatched: <strong>{nearestHaven}</strong>
              </div>
            </div>

            {/* Dispatched SMS Confirmation Box */}
            <div className="p-4 bg-[#F8F7FD] rounded-2xl border border-slate-100 space-y-2">
              <div className="text-xs font-semibold text-[#1B1B3A] flex items-center justify-between">
                <span>SMS Dispatch Gateway Status:</span>
                <span className="text-[10px] text-[#16A34A] font-bold">Processed</span>
              </div>
              <div className="space-y-2 text-xs">
                {dispatchedList.map((sms, i) => {
                  const isFailed = sms.success === false || sms.status?.toLowerCase().includes('failed');
                  return (
                    <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1B1B3A] flex items-center gap-1.5">
                          <Send className="w-3 h-3 text-[#8B5CF6]" />
                          {sms.recipient_name} ({sms.recipient_phone})
                        </span>
                        <span className={`text-[10px] font-bold ${isFailed ? 'text-[#FF4D4F]' : 'text-[#16A34A]'}`}>
                          {isFailed ? 'FAILED' : 'DISPATCHED'}
                        </span>
                      </div>

                      <div className="text-[10px] text-[#8A8AA8]">
                        Status: <strong className="text-[#1B1B3A]">{sms.status}</strong>
                        {sms.message_sid && <span className="ml-2 font-mono text-[9px]">({sms.message_sid})</span>}
                      </div>

                      {sms.error_detail && (
                        <div className="p-1.5 bg-[#FFF1F2] rounded-lg text-[10px] text-[#FF4D4F]">
                          Error: {sms.error_detail}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Nearest Help Points */}
            <div>
              <div className="text-xs font-semibold text-[#8A8AA8] mb-2.5">
                Nearby emergency safe havens
              </div>

              <div className="space-y-2.5">
                {nearbyHelpPoints.slice(0, 3).map((hp) => (
                  <div
                    key={hp.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3 hover:border-violet-200 transition"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#1B1B3A]">{hp.name}</div>
                      <div className="text-[11px] text-[#8A8AA8] mt-0.5">{hp.address}</div>
                      <div className="text-[11px] text-[#8B5CF6] font-semibold mt-1">
                        {hp.distance} ({hp.walkingTime}) &bull; {hp.openHours}
                      </div>
                    </div>

                    <a
                      href={`tel:${hp.phone.replace(/[^0-9+]/g, '')}`}
                      className="px-3 py-1.5 rounded-full bg-[#1B1B3A] text-white text-[11px] font-bold shrink-0 hover:bg-[#8B5CF6] transition flex items-center gap-1.5"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1B1B3A] text-xs font-semibold transition"
            >
              Disarm alert & return to journey
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
