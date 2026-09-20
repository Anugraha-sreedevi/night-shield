import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, PhoneCall, Navigation, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SOSButton() {
  const { emergencyActive, emergencyData, triggerSOS, cancelEmergency, contacts } = useApp();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const animFrameRef = useRef(null);

  const startHold = () => {
    if (emergencyActive) return;
    setHolding(true);
    const startTime = Date.now();
    const duration = 2000;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (elapsed < duration) {
        animFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        setProgress(100);
        setHolding(false);
        triggerSOS();
      }
    };

    animFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const endHold = () => {
    if (progress < 100) {
      setHolding(false);
      setProgress(0);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="relative flex items-center justify-center">
          {emergencyActive && (
            <div className="absolute -inset-3 rounded-full bg-[#FF4D4F]/20 animate-ping"></div>
          )}

          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onMouseLeave={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center font-black transition-transform active:scale-95 select-none shadow-coral-glow ${
              emergencyActive
                ? 'bg-[#FF4D4F] text-white ring-4 ring-[#FF4D4F]/40'
                : holding
                ? 'bg-[#E03E40] text-white ring-4 ring-[#FF4D4F]/40 scale-105'
                : 'bg-[#FF4D4F] hover:bg-[#E03E40] text-white'
            }`}
          >
            {holding && (
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle
                  cx="48"
                  cy="48"
                  r="44"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="5"
                  strokeDasharray="276"
                  strokeDashoffset={276 - (276 * progress) / 100}
                  className="transition-all duration-75"
                />
              </svg>
            )}

            <ShieldAlert className={`w-8 h-8 ${emergencyActive ? 'animate-bounce' : ''}`} />
            <span className="text-xs font-extrabold tracking-wider mt-0.5">SOS</span>
          </button>
        </div>

        <p className="text-[11px] font-semibold text-[#8A8AA8] mt-2 text-center">
          {emergencyActive ? (
            <span className="text-[#FF4D4F] font-bold animate-pulse">Emergency broadcast active</span>
          ) : holding ? (
            <span className="text-[#EA580C] font-bold">Hold for 2 seconds...</span>
          ) : (
            'Press & hold 2s for emergency'
          )}
        </p>
      </div>

      {/* Emergency Active Modal via Portal */}
      {emergencyActive && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fadeIn"
          style={{ zIndex: 99999 }}
        >
          <div
            className="relative w-full max-w-lg bg-white dark:bg-[#151528] rounded-card-lg p-6 md:p-8 shadow-2xl text-[#1B1B3A] dark:text-[#F4F3FD] max-h-[90vh] overflow-y-auto border border-slate-100 dark:border-white/10"
            style={{ zIndex: 100000 }}
          >
            
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FFF1F2] border-2 border-[#FF4D4F] flex items-center justify-center text-[#FF4D4F]">
                  <ShieldAlert className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1B1B3A]">
                    Emergency broadcast dispatched
                  </h3>
                  <p className="text-xs text-[#FF4D4F] font-semibold">Live GPS distress payload transmitted</p>
                </div>
              </div>
              <button
                onClick={cancelEmergency}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                title="Cancel SOS"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Trusted Contacts Dispatched Cards */}
            <div className="mt-5 bg-[#F8F7FD] rounded-2xl p-4 border border-slate-100">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-[#1B1B3A] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  Simulated alerts dispatched to guardians ({contacts.length})
                </span>
                <span className="text-[10px] text-[#16A34A] font-bold">DELIVERED</span>
              </div>
              
              <div className="space-y-1.5 mt-2">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 text-xs shadow-sm">
                    <div>
                      <div className="font-bold text-[#1B1B3A]">{c.name} ({c.relation})</div>
                      <div className="text-[#8A8AA8] font-mono text-[11px]">{c.phone}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#DDF8EA] text-[#16A34A] text-[10px] font-bold">
                      SMS + GPS sent
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearest Help Points */}
            <div className="mt-5">
              <h4 className="text-xs font-bold text-[#1B1B3A] mb-3 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-[#8B5CF6]" /> Nearest emergency safe havens
              </h4>

              <div className="space-y-2.5">
                {(emergencyData?.nearest_help_points || []).map((hp) => (
                  <div
                    key={hp.id}
                    className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3 hover:border-violet-200 transition"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#1B1B3A]">{hp.name}</div>
                      <div className="text-[11px] text-[#8A8AA8] mt-0.5">{hp.address}</div>
                      <div className="text-[11px] text-[#8B5CF6] font-semibold mt-1">
                        📍 {hp.distance_formatted} away (~{hp.walking_time_min} min walk) &bull; {hp.operating_hours}
                      </div>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <a
                        href={`tel:${hp.phone.replace(/[^0-9+]/g, '')}`}
                        className="px-3 py-1.5 bg-[#FF4D4F] hover:bg-[#E03E40] text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <PhoneCall className="w-3 h-3" /> Call
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cancel Action */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={cancelEmergency}
                className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#1B1B3A] text-xs font-bold transition"
              >
                Disarm / Cancel false alarm
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
}
