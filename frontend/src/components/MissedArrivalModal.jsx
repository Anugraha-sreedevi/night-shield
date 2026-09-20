import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, ShieldCheck, PhoneOutgoing, Clock, AlertTriangle, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function MissedArrivalModal() {
  const {
    missedArrivalState,
    confirmSafety,
    escalateMissedArrival,
    triggerSOS,
  } = useApp();

  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval = null;
    if (missedArrivalState.visible && !missedArrivalState.escalated && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            escalateMissedArrival();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!missedArrivalState.visible) {
      setTimer(60);
    }
    return () => clearInterval(interval);
  }, [missedArrivalState.visible, missedArrivalState.escalated, timer]);

  if (!missedArrivalState.visible) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fadeIn"
      style={{ zIndex: 99999 }}
    >
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#151528] rounded-card-lg p-6 md:p-8 shadow-2xl text-[#1B1B3A] dark:text-[#F4F3FD] border border-slate-100 dark:border-white/10"
        style={{ zIndex: 100000 }}
      >
        
        {!missedArrivalState.escalated ? (
          /* Stage 1: Are you safe check-in */
          <div className="space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FFE9D6] text-[#EA580C] flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#1B1B3A]">Missed arrival check-in</h3>
              <p className="text-xs text-[#8A8AA8] mt-1">Stage 1: In-app safety verification</p>
            </div>

            <p className="text-xs text-[#8A8AA8] leading-relaxed">
              Your estimated arrival time at your destination has passed by more than 5 minutes. 
              Please confirm your status within:
            </p>

            {/* Countdown Box */}
            <div className="py-3 px-6 bg-[#F8F7FD] rounded-full inline-flex items-center justify-center gap-2 border border-slate-100">
              <Clock className="w-5 h-5 text-[#8B5CF6] animate-spin" />
              <span className="text-2xl font-extrabold text-[#1B1B3A] font-mono">
                00:{timer < 10 ? `0${timer}` : timer}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={confirmSafety}
                className="w-full py-3 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>I am safe (Extend ETA +10m)</span>
              </button>

              <button
                onClick={() => {
                  confirmSafety();
                  triggerSOS();
                }}
                className="w-full py-3 rounded-full bg-[#FF4D4F] hover:bg-[#E03E40] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-coral-glow transition"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>I need immediate assistance (SOS)</span>
              </button>

              <button
                onClick={escalateMissedArrival}
                className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#8A8AA8] hover:text-[#1B1B3A] text-xs font-semibold transition"
              >
                Simulate timeout (Test auto-escalation)
              </button>
            </div>
          </div>
        ) : (
          /* Stage 2: Escalated to Contacts */
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FFF1F2] text-[#FF4D4F] flex items-center justify-center shrink-0">
                <PhoneOutgoing className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1B1B3A]">Stage 2: Guardians alerted</h3>
                <p className="text-xs text-[#FF4D4F] font-semibold">Automated dispatch delivered</p>
              </div>
            </div>

            <p className="text-xs text-[#8A8AA8]">
              No response was received within 60s. NightShield has automatically dispatched emergency SMS alerts with your last known coordinates to all trusted contacts.
            </p>

            {/* Dispatched SMS Cards */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {missedArrivalState.dispatchedAlerts.map((sms, i) => {
                const isFailed = sms.success === false || sms.status?.toLowerCase().includes('failed');
                return (
                  <div key={i} className="p-3 bg-[#F8F7FD] rounded-2xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[#1B1B3A]">
                      <span className="font-bold flex items-center gap-1">
                        <Send className="w-3 h-3 text-[#8B5CF6]" /> {sms.recipient_name} ({sms.recipient_phone})
                      </span>
                      <span className={`text-[10px] font-bold ${isFailed ? 'text-[#FF4D4F]' : 'text-[#16A34A]'}`}>
                        {isFailed ? 'DISPATCH FAILED' : 'SENT'}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#8A8AA8]">
                      Gateway: <strong className="text-[#1B1B3A]">{sms.status}</strong>
                    </div>

                    {sms.error_detail && (
                      <div className="p-2 bg-[#FFF1F2] border border-[#FF4D4F]/20 rounded-xl text-[10px] text-[#FF4D4F] font-medium">
                        Alert Failure: {sms.error_detail}
                      </div>
                    )}

                    <p className="text-[11px] text-[#8A8AA8] font-mono bg-white p-2 rounded-xl border border-slate-100 leading-snug">
                      {sms.message}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={confirmSafety}
                className="flex-1 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1B1B3A] text-xs font-semibold"
              >
                Close & mark safe
              </button>
              <button
                onClick={() => {
                  confirmSafety();
                  triggerSOS();
                }}
                className="flex-1 py-2.5 rounded-full bg-[#FF4D4F] hover:bg-[#E03E40] text-white text-xs font-bold shadow-coral-glow"
              >
                Trigger SOS
              </button>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
