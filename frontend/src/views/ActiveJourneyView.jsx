import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Share2, 
  Clock, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  ShieldCheck,
  Check,
  ShieldAlert,
  AlertTriangle,
  Compass,
  Sparkles,
  MapPin,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import MapView from '../components/MapView';

export default function ActiveJourneyView() {
  const { 
    activeJourney, 
    setActiveJourney, 
    setActiveTab, 
    triggerMissedArrivalDemo,
    triggerSOS,
    addNotification,
    contacts,
    checkInPrompt,
    setCheckInPrompt,
    triggerOffRouteCheckIn,
    triggerSuddenStopCheckIn
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(activeJourney?.progress_pct || 20);
  const [simulatedMinutesLeft, setSimulatedMinutesLeft] = useState(activeJourney?.eta_minutes || 22);

  // Advance simulated progress
  useEffect(() => {
    if (!activeJourney) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        const nextVal = prev + 2;
        if (nextVal % 10 === 0) {
          api.journey.update({
            journey_id: activeJourney.id,
            progress_pct: nextVal,
          }).catch(() => {});
        }
        return nextVal;
      });

      setSimulatedMinutesLeft((prev) => (prev > 1 ? prev - 1 : 1));
    }, 4000);

    return () => clearInterval(timer);
  }, [activeJourney]);

  const shareUrl = activeJourney
    ? `${window.location.origin}/track/${activeJourney.share_token}`
    : '';

  const copyShareLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    addNotification(
      'Guardian link copied',
      'Share link copied to clipboard. Guardians can track with zero login.',
      'info'
    );
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCompleteJourney = async () => {
    if (!activeJourney) return;
    try {
      await api.journey.complete(activeJourney.id);
      setActiveJourney(null);
      addNotification('Journey completed safely', 'Thank you for traveling with NightShield!', 'success');
      setActiveTab('feedback'); // Smoothly invite passenger safety feedback
    } catch (e) {
      console.error(e);
    }
  };

  if (!activeJourney) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F1F0FA]">
        <div className="max-w-md w-full p-8 saas-card text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#ECEAF8] text-[#8B5CF6] flex items-center justify-center mx-auto">
            <Navigation className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1B1B3A]">No active commute</h2>
            <p className="text-xs text-[#8A8AA8] mt-1 leading-relaxed">
              You do not have a live monitored journey running right now. Plan a route to enable live guardian sharing, adaptive missed-arrival detection, and AI safety monitoring.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('plan')}
            className="w-full py-3 rounded-full gradient-violet-blue text-white text-xs font-bold shadow-btn hover:brightness-110 transition"
          >
            Go to route planner
          </button>
        </div>
      </div>
    );
  }

  const origLat = activeJourney.origin_stop?.lat || 12.9980;
  const origLng = activeJourney.origin_stop?.lng || 77.5850;
  const destLat = activeJourney.dest_stop?.lat || 12.9450;
  const destLng = activeJourney.dest_stop?.lng || 77.5980;
  const p = progress / 100;
  const currentPos = {
    lat: origLat * (1 - p) + destLat * p,
    lng: origLng * (1 - p) + destLng * p,
  };

  const predictedDelayMin = activeJourney.predicted_delay?.predicted_delay_minutes || 6;
  const baseEta = activeJourney.eta_minutes || 24;
  const adaptiveBuffer = baseEta + predictedDelayMin + 5;

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden p-4 md:p-6 gap-6 bg-[#F1F0FA]">
      
      {/* Left Monitoring Column */}
      <div className="w-full lg:w-[460px] overflow-y-auto space-y-5 pr-1">
        
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#16A34A] text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] animate-ping"></span>
            <span>Live journey monitored</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#ECEAF8] text-[#8B5CF6] text-[10px] font-bold border border-[#8B5CF6]/20">
            AI trained on simulated data
          </span>
        </div>

        {/* Journey Details Card */}
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8A8AA8]">Route & line</span>
            <span className="px-3 py-1 rounded-full bg-[#ECEAF8] text-[#8B5CF6] text-xs font-bold">
              {activeJourney.route?.name || 'Metro Express'}
            </span>
          </div>

          {/* Stops Path */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-[#3B82F6] shadow-md shrink-0"></div>
              <div>
                <div className="text-xs font-bold text-[#1B1B3A]">
                  {activeJourney.origin_stop?.name || 'Origin station'}
                </div>
                <div className="text-[11px] text-[#8A8AA8]">Departed on schedule</div>
              </div>
            </div>

            <div className="w-0.5 h-6 bg-gradient-to-b from-[#3B82F6] to-[#8B5CF6] ml-1.5"></div>

            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-[#8B5CF6] shadow-md shrink-0"></div>
              <div>
                <div className="text-xs font-bold text-[#1B1B3A]">
                  {activeJourney.dest_stop?.name || 'Destination station'}
                </div>
                <div className="text-[11px] text-[#8A8AA8]">Estimated arrival in {simulatedMinutesLeft} min</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#8A8AA8]">Journey progress</span>
              <span className="font-bold text-[#8B5CF6]">{progress}%</span>
            </div>
            <div className="h-2.5 w-full bg-[#EAE9F2] rounded-full overflow-hidden">
              <div
                className="h-full gradient-violet-blue rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Adaptive Missed-Arrival Watchdog */}
          <div className="p-4 bg-[#F8F7FD] rounded-2xl border border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8B5CF6]" />
                <span className="font-bold text-[#1B1B3A]">Adaptive Missed-Arrival Watchdog</span>
              </div>
              <button
                onClick={triggerMissedArrivalDemo}
                className="px-2.5 py-1 rounded-full bg-[#FFE9D6] hover:bg-[#FED7AA] text-[#EA580C] text-[10px] font-bold transition"
              >
                Test 3-step alert
              </button>
            </div>
            
            <div className="text-[11px] text-[#8A8AA8] leading-relaxed">
              Alert threshold uses predicted corridor delay (<strong className="text-[#1B1B3A]">+{predictedDelayMin}m</strong>) so normal traffic delays do not cause false alarms.
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-[#8A8AA8]">Dynamic watchdog window:</span>
              <span className="font-bold text-[#8B5CF6]">{adaptiveBuffer} mins ({baseEta}m base + {predictedDelayMin}m AI delay + 5m buffer)</span>
            </div>

            <div className="pt-1 flex items-center justify-between text-[10px] text-[#8A8AA8]">
              <span>Escalation: 1. Check-in prompt</span>
              <span>2. Guardian SMS</span>
              <span>3. Smart SOS broadcast</span>
            </div>
          </div>

          {/* AI Check-in Simulators (Off-route & Sudden-stop) */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1B1B3A] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8B5CF6]" />
                AI Anomaly Detectors
              </span>
              <span className="text-[10px] text-[#8A8AA8]">Live sensors</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={triggerOffRouteCheckIn}
                className="py-2 px-3 rounded-xl bg-[#ECEAF8] hover:bg-[#DDD8F8] text-[#8B5CF6] text-[11px] font-bold transition text-center"
              >
                Simulate off-route
              </button>
              <button
                onClick={triggerSuddenStopCheckIn}
                className="py-2 px-3 rounded-xl bg-[#ECEAF8] hover:bg-[#DDD8F8] text-[#8B5CF6] text-[11px] font-bold transition text-center"
              >
                Simulate sudden stop
              </button>
            </div>
          </div>

        </div>

        {/* Share Live Progress Card */}
        <div className="saas-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1B1B3A]">
              <Share2 className="w-4 h-4 text-[#8B5CF6]" />
              <span>Share live trip with guardians</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#DDF8EA] text-[#16A34A] text-[10px] font-bold">
              No login needed
            </span>
          </div>

          <p className="text-xs text-[#8A8AA8] leading-relaxed">
            Sends an encrypted public link to your {contacts.length} trusted contacts. They can follow your live bus, ETA, and corridor safety in real-time.
          </p>

          <div className="flex gap-2">
            <button
              onClick={copyShareLink}
              className="flex-1 py-2.5 rounded-full gradient-violet-blue text-white text-xs font-bold flex items-center justify-center gap-2 shadow-btn hover:brightness-110 transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link copied!' : 'Copy share link'}</span>
            </button>

            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-[#1B1B3A] flex items-center justify-center transition shadow-sm"
              title="Open link in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Smart SOS Button inside Active Journey */}
        <div className="p-4 rounded-card bg-[#FFF1F2] border border-[#FF4D4F]/20 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#FF4D4F]">Smart SOS Emergency</div>
              <div className="text-[11px] text-[#8A8AA8]">
                Auto-attaches Route, GPS ({currentPos.lat.toFixed(3)}, {currentPos.lng.toFixed(3)}), ETA ({simulatedMinutesLeft}m), Risk Score ({activeJourney.risk_score || 35}), and nearest safe haven.
              </div>
            </div>
            <button
              onClick={() => triggerSOS(currentPos)}
              className="px-5 py-2.5 rounded-full bg-[#FF4D4F] hover:bg-[#E03E40] text-white text-xs font-bold shadow-coral-glow shrink-0 transition"
            >
              Smart SOS
            </button>
          </div>
        </div>

        {/* End Journey Button */}
        <button
          onClick={handleCompleteJourney}
          className="w-full py-3.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-[#1B1B3A] text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
          <span>I have arrived safely (End journey & leave feedback)</span>
        </button>

      </div>

      {/* Right Map Canvas */}
      <div className="flex-1 w-full min-h-[70vh] h-[70vh] lg:h-full relative">
        <MapView
          selectedRouteId={activeJourney.route_id}
          userPos={currentPos}
          highlightStops={[activeJourney.origin_stop_id, activeJourney.destination_stop_id]}
          className="w-full h-full"
        />
      </div>

      {/* Check-In Prompt Modal (Off-Route / Sudden Stop) */}
      {checkInPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-[26px] p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFE9D6] text-[#EA580C] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#1B1B3A]">{checkInPrompt.title}</h3>
                <p className="text-[11px] text-[#8A8AA8]">Automated NightShield Watchdog Check-in</p>
              </div>
            </div>

            <p className="text-xs text-[#1B1B3A] leading-relaxed bg-[#F8F7FD] p-3.5 rounded-2xl border border-slate-100">
              {checkInPrompt.message}
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setCheckInPrompt(null);
                  addNotification('Status Confirmed', 'Check-in verified: Passenger reported safe.', 'success');
                }}
                className="w-full py-3 rounded-full bg-[#DDF8EA] hover:bg-[#C9F3DC] text-[#16A34A] text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>I am safe (Dismiss prompt)</span>
              </button>

              <button
                onClick={() => {
                  setCheckInPrompt(null);
                  triggerSOS(currentPos);
                }}
                className="w-full py-2.5 rounded-full bg-[#FF4D4F] hover:bg-[#E03E40] text-white text-xs font-bold transition shadow-coral-glow"
              >
                I need help &bull; Escalate SOS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
