import React, { useState, useEffect } from 'react';
import { 
  Map, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  ShieldAlert, 
  Plus, 
  Compass, 
  Navigation,
  ArrowRight
} from 'lucide-react';
import { cityData, initialActiveJourney } from '../mockData';

export default function LiveJourneyView({ onOpenSOS, contacts, setMissedArrivalActive }) {
  const [journeyProgress, setJourneyProgress] = useState(65); // % along line
  const [secondsRemaining, setSecondsRemaining] = useState(14 * 60);
  const [delayMinutesAdded, setDelayMinutesAdded] = useState(0);
  const [isMissedArrival, setIsMissedArrival] = useState(false);
  const [autoNotified, setAutoNotified] = useState(false);

  // Simulated GPS movement along SVG path
  useEffect(() => {
    const interval = setInterval(() => {
      setJourneyProgress((prev) => {
        if (prev >= 98) return 98;
        return prev + 0.4;
      });
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Format MM:SS
  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Simulate Delay (+10m)
  const handleSimulateDelay = () => {
    const newDelay = delayMinutesAdded + 10;
    setDelayMinutesAdded(newDelay);
    
    // Trigger missed arrival if delay exceeds 5 minutes
    if (newDelay >= 5) {
      setIsMissedArrival(true);
      setAutoNotified(true);
      if (setMissedArrivalActive) setMissedArrivalActive(true);
    }
  };

  const handleResolveSafety = () => {
    setIsMissedArrival(false);
    setDelayMinutesAdded(0);
    if (setMissedArrivalActive) setMissedArrivalActive(false);
  };

  // SVG coordinates interpolation for Line 1 (from (120, 80) -> (220, 130) -> (320, 240) -> (420, 230) -> (380, 390))
  // Calculate marker (x, y) along the multi-point path
  const linePoints = [
    { x: 120, y: 80 },   // North Tech Hub
    { x: 220, y: 130 },  // Cyberia Crossing
    { x: 320, y: 240 },  // Central Interchange
    { x: 420, y: 230 },  // Grand Terminal
    { x: 380, y: 390 },  // Southgate Junction
  ];

  const getMarkerPos = (pct) => {
    const totalSegments = linePoints.length - 1;
    const scaled = (pct / 100) * totalSegments;
    const segIndex = Math.min(Math.floor(scaled), totalSegments - 1);
    const subPct = scaled - segIndex;

    const p1 = linePoints[segIndex];
    const p2 = linePoints[segIndex + 1];

    return {
      x: p1.x + (p2.x - p1.x) * subPct,
      y: p1.y + (p2.y - p1.y) * subPct,
    };
  };

  const markerPos = getMarkerPos(journeyProgress);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1B1B3A]">
            Live schematic transit map
          </h2>
          <p className="text-xs md:text-sm text-[#8A8AA8] mt-0.5">
            Real-time simulated GPS tracking along Line 1 Metro corridor with watchdog escalation.
          </p>
        </div>

        {/* Demo Delay Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateDelay}
            className="px-4 py-2.5 rounded-full bg-[#FFE9D6] hover:bg-[#FED7AA] text-[#EA580C] text-xs font-bold flex items-center gap-2 transition shadow-sm"
          >
            <Clock className="w-4 h-4" />
            <span>Simulate delay (+10 min)</span>
          </button>

          <button
            onClick={onOpenSOS}
            className="px-4 py-2.5 rounded-full bg-[#FF4D4F] hover:bg-[#E03E40] text-white text-xs font-bold shadow-coral-glow transition"
          >
            Emergency SOS
          </button>
        </div>
      </div>

      {/* Missed Arrival Escalation Banner (Triggered by Delay) */}
      {isMissedArrival && (
        <div className="p-5 rounded-card-lg bg-gradient-to-r from-[#FFF1F2] to-[#FFF9F5] border-2 border-[#FF4D4F] shadow-lg animate-fadeIn space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF4D4F] text-white flex items-center justify-center shrink-0 animate-pulse">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#FF4D4F] uppercase tracking-wide">
                  Missed arrival detected (ETA + {delayMinutesAdded} min exceeded)
                </h3>
                <p className="text-xs text-[#1B1B3A] mt-0.5 font-medium">
                  Automated safety escalation protocol fired. Emergency SMS cards dispatched to {contacts.length} trusted contacts.
                </p>
              </div>
            </div>

            <button
              onClick={handleResolveSafety}
              className="px-4 py-1.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-sm transition"
            >
              I am safe (Reset)
            </button>
          </div>

          {/* Auto-Dispatched SMS Alert Card */}
          {autoNotified && (
            <div className="p-3 bg-white rounded-2xl border border-[#FF4D4F]/20 text-xs space-y-1">
              <div className="flex justify-between font-semibold text-[#1B1B3A]">
                <span className="flex items-center gap-1.5 text-[#FF4D4F]">
                  <Send className="w-3.5 h-3.5" /> Auto-alert text dispatched to guardians:
                </span>
                <span className="text-[11px] text-[#16A34A] font-bold">SENT (Carrier Simulated)</span>
              </div>
              <p className="text-[11px] font-mono text-[#8A8AA8] bg-[#F8F7FD] p-2 rounded-xl">
                "[NightShield ALERT] Elena has missed scheduled arrival at Southgate Junction by 10+ min. Last known GPS: (12.9720, 77.6010) near Central Interchange."
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: SVG Map Canvas (Left) + Telemetry Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Schematic SVG Map Card */}
        <div className="lg:col-span-8 saas-card p-6 flex flex-col justify-between overflow-hidden relative">
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] animate-ping"></div>
              <h3 className="text-sm font-bold text-[#1B1B3A]">
                Line 1 Metro corridor
              </h3>
            </div>

            <span className="px-3 py-1 bg-[#DDF8EA] text-[#16A34A] text-xs font-bold rounded-full">
              GPS active
            </span>
          </div>

          {/* Pure SVG Schematic Map */}
          <div className="w-full h-80 md:h-96 bg-[#F8F7FD] rounded-2xl border border-slate-100 flex items-center justify-center relative overflow-hidden">
            
            <svg viewBox="0 0 700 480" className="w-full h-full">
              {/* Background Grid Lines for aesthetic */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#EAE9F2" strokeWidth="1" opacity="0.6" />
                </pattern>
                <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#FF5FA2" />
                </linearGradient>
              </defs>

              <rect width="700" height="480" fill="url(#grid)" />

              {/* Other Background Lines (faint) */}
              <path
                d="M 220 130 L 320 240 L 460 140 L 550 240"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="4"
                strokeDasharray="6, 6"
                opacity="0.35"
              />
              <path
                d="M 460 140 L 320 240 L 180 220 L 110 290"
                fill="none"
                stroke="#10B981"
                strokeWidth="4"
                strokeDasharray="6, 6"
                opacity="0.35"
              />
              <path
                d="M 240 340 L 420 230 L 380 390 L 490 430"
                fill="none"
                stroke="#FF5FA2"
                strokeWidth="4"
                strokeDasharray="6, 6"
                opacity="0.35"
              />

              {/* Active Route Line (Line 1): North Tech -> Cyberia -> Central -> Grand -> Southgate */}
              <path
                d="M 120 80 L 220 130 L 320 240 L 420 230 L 380 390"
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Transit Stops on Active Line */}
              {linePoints.map((pt, idx) => {
                const stopObj = cityData.stops.find(s => Math.abs(s.x - pt.x) < 50 && Math.abs(s.y - pt.y) < 50);
                return (
                  <g key={idx}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="8"
                      fill="#FFFFFF"
                      stroke="#8B5CF6"
                      strokeWidth="4"
                    />
                    <text
                      x={pt.x}
                      y={pt.y - 14}
                      textAnchor="middle"
                      fill="#1B1B3A"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="Plus Jakarta Sans"
                    >
                      {stopObj?.name || `Stop ${idx + 1}`}
                    </text>
                  </g>
                );
              })}

              {/* Other city stop nodes */}
              {cityData.stops.filter(s => !linePoints.some(lp => Math.abs(lp.x - s.x) < 20)).map(s => (
                <g key={s.id} opacity="0.6">
                  <circle cx={s.x} cy={s.y} r="5" fill="#FFFFFF" stroke="#8A8AA8" strokeWidth="2.5" />
                  <text x={s.x} y={s.y + 16} textAnchor="middle" fill="#8A8AA8" fontSize="9" fontWeight="600">
                    {s.name}
                  </text>
                </g>
              ))}

              {/* Moving Location Dot (Simulated GPS Tracker) */}
              <g transform={`translate(${markerPos.x}, ${markerPos.y})`}>
                {/* Glowing halo rings */}
                <circle r="22" fill="#3B82F6" opacity="0.18" className="animate-ping" />
                <circle r="14" fill="#8B5CF6" opacity="0.35" />
                <circle r="8" fill="#FF5FA2" stroke="#FFFFFF" strokeWidth="3" />
              </g>

            </svg>

            {/* Float Badge: Location indicator */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-[11px] font-bold text-[#1B1B3A] shadow-sm border border-slate-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF5FA2] animate-pulse"></span>
              <span>GPS dot moving along active route line</span>
            </div>

          </div>

          <div className="flex items-center justify-between mt-3 text-xs text-[#8A8AA8]">
            <span>Start: <strong>North Tech Hub</strong></span>
            <span>Target: <strong>Southgate Junction</strong></span>
          </div>

        </div>

        {/* Telemetry & Expected Arrival Countdown (Right) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Countdown Card */}
          <div className="saas-card p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#ECEAF8] text-[#8B5CF6] flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>

            <div>
              <div className="text-xs font-semibold text-[#8A8AA8]">
                Expected arrival countdown
              </div>
              <div className="text-4xl font-extrabold text-[#1B1B3A] tracking-tight mt-1 font-mono">
                {formatTime(secondsRemaining)}
              </div>
              <div className="text-xs font-semibold text-[#8B5CF6] mt-1">
                Estimated arrival at 12:02 AM
              </div>
            </div>

            {/* Progress Bar */}
            <div className="pt-2">
              <div className="flex justify-between text-xs text-[#8A8AA8] mb-1">
                <span>Route progress</span>
                <span className="font-bold text-[#1B1B3A]">{Math.round(journeyProgress)}%</span>
              </div>
              <div className="h-2 w-full bg-[#EAE9F2] rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-pink-violet rounded-full transition-all duration-300"
                  style={{ width: `${journeyProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Next Stop Card */}
          <div className="saas-card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A8AA8]">
                Approaching station
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-[#DDF8EA] text-[#16A34A] text-[11px] font-bold">
                Platform 2
              </span>
            </div>

            <div className="text-base font-bold text-[#1B1B3A]">
              Central Interchange
            </div>
            <p className="text-xs text-[#8A8AA8]">
              High passenger presence, 24x7 well-lit corridor with CCTV security.
            </p>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#8A8AA8]">
              <span>Transfer available:</span>
              <strong className="text-[#8B5CF6]">Line 4 & Line 7</strong>
            </div>
          </div>

          {/* Auto-Escalation Status Info */}
          <div className="p-4 rounded-2xl bg-[#F8F7FD] border border-slate-100 text-xs text-[#8A8AA8] space-y-1">
            <div className="font-bold text-[#1B1B3A] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#16A34A]" />
              <span>Missed-arrival watchdog armed</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              If your arrival passes 12:07 AM without check-in, guardians will be auto-notified with coordinates.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
