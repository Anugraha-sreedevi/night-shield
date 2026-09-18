import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Zap,
  ArrowUpRight,
  HelpCircle,
  X,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';
import MapView from '../components/MapView';

export default function PlanJourneyView() {
  const { 
    stops, 
    routes, 
    setActiveJourney, 
    setActiveTab, 
    simulatedClock,
    addNotification 
  } = useApp();

  const [originId, setOriginId] = useState('stop_01'); // North Tech Hub
  const [destId, setDestId] = useState('stop_09'); // Southgate Junction
  const [selectedRouteId, setSelectedRouteId] = useState('route_n1');
  
  const [riskData, setRiskData] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [rankedRoutes, setRankedRoutes] = useState([]);
  const [bestTime, setBestTime] = useState(null);
  const [loadingStart, setLoadingStart] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);

  const matchedRoutes = useMemo(() => {
    return routes.filter((r) => r.stops.includes(originId) && r.stops.includes(destId));
  }, [routes, originId, destId]);

  const activeRoute = useMemo(() => {
    return routes.find((r) => r.id === selectedRouteId) || routes[0];
  }, [routes, selectedRouteId]);

  // Load AI Risk, Ranked Routes, Alternatives, Best Time
  useEffect(() => {
    if (!originId || !destId || !selectedRouteId) return;

    let isMounted = true;
    const fetchData = async () => {
      try {
        const [riskRes, altRes, rankedRes, bestTimeRes] = await Promise.all([
          api.risk.assess(selectedRouteId, originId, destId),
          api.risk.getAlternatives(selectedRouteId, originId, destId),
          api.risk.rankRoutes(originId, destId),
          api.risk.getBestTime(selectedRouteId, originId),
        ]);

        if (isMounted) {
          setRiskData(riskRes);
          setAlternatives(altRes || []);
          setRankedRoutes(rankedRes || []);
          setBestTime(bestTimeRes || null);
        }
      } catch (err) {
        console.error('Error fetching AI risk data:', err);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [selectedRouteId, originId, destId, routes]);

  const handleStartJourney = async () => {
    setLoadingStart(true);
    try {
      const travelMins = activeRoute?.base_duration_min || 24;
      const res = await api.journey.start({
        origin_id: originId,
        dest_id: destId,
        route_id: selectedRouteId,
        eta_minutes: travelMins,
      });

      setActiveJourney({
        id: res.journey_id,
        user_id: 'user_demo_778',
        origin_stop_id: originId,
        destination_stop_id: destId,
        route_id: selectedRouteId,
        origin_stop: res.origin_stop,
        dest_stop: res.dest_stop,
        route: activeRoute,
        status: 'active',
        eta_minutes: res.eta_minutes,
        eta_timestamp: res.eta_timestamp,
        current_lat: res.origin_stop.lat,
        current_lng: res.origin_stop.lng,
        progress_pct: 0,
        share_token: res.share_token,
        risk_score: riskData?.risk_score || 35,
        predicted_delay: riskData?.predicted_delay || { predicted_delay_minutes: 0, confidence_pct: 94 }
      });

      addNotification(
        'Safe journey initiated',
        `Live tracking active on ${activeRoute?.name}. Missed arrival monitoring armed.`,
        'success'
      );
      setActiveTab('active');
    } catch (err) {
      console.error('Error starting journey:', err);
    } finally {
      setLoadingStart(false);
    }
  };

  const swapStops = () => {
    const temp = originId;
    setOriginId(destId);
    setDestId(temp);
  };

  // Map ranking badges to corridors
  const getBadgeForRoute = (routeId) => {
    const ranked = rankedRoutes.find((r) => r.route_id === routeId);
    return ranked?.ai_badge || null;
  };

  const getDelayForRoute = (routeId) => {
    const ranked = rankedRoutes.find((r) => r.route_id === routeId);
    return ranked?.predicted_delay || null;
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden p-4 md:p-6 gap-6 bg-[#F1F0FA]">
      
      {/* Left Planning Column */}
      <div className="w-full lg:w-[460px] overflow-y-auto space-y-5 pr-1">
        
        {/* Section Header */}
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#8B5CF6] text-xs font-bold">
              <Compass className="w-4 h-4" />
              <span>AI transit & risk planner</span>
            </div>
            {/* Small UI Label Required by User */}
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECEAF8] text-[#8B5CF6] text-[10px] font-bold border border-[#8B5CF6]/20">
              AI trained on simulated data
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1B1B3A] mt-1 tracking-tight">
            Plan your late-night journey
          </h2>
          <p className="text-xs text-[#8A8AA8]">
            Real-time fleet telemetry, Scikit-learn AI risk evaluation, and adaptive routing.
          </p>
        </div>

        {/* Origin & Destination Card */}
        <div className="saas-card p-5 space-y-3.5">
          {/* Origin */}
          <div>
            <label className="text-[11px] font-semibold text-[#8A8AA8] block mb-1">
              Origin station
            </label>
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              className="w-full py-2.5 px-4 bg-[#F8F7FD] rounded-full text-xs font-bold text-[#1B1B3A] border border-slate-200/80 focus:outline-none focus:border-[#8B5CF6]"
            >
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.crowd_level} crowd &bull; {s.lighting_quality} light)
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-1">
            <button
              onClick={swapStops}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#ECEAF8] text-[#8A8AA8] hover:text-[#8B5CF6] flex items-center justify-center transition shadow-sm"
              title="Reverse origin and destination"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Destination */}
          <div>
            <label className="text-[11px] font-semibold text-[#8A8AA8] block mb-1">
              Destination station
            </label>
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full py-2.5 px-4 bg-[#F8F7FD] rounded-full text-xs font-bold text-[#1B1B3A] border border-slate-200/80 focus:outline-none focus:border-[#8B5CF6]"
            >
              {stops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Departure Info */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-[#8A8AA8]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" /> Departure time:
            </span>
            <span className="font-bold text-[#1B1B3A]">
              Now ({simulatedClock})
            </span>
          </div>
        </div>

        {/* Smart Route Ranking Selector */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-[#1B1B3A] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span>Smart corridor ranking</span>
              <span className="text-[10px] text-[#8B5CF6] font-normal">(ETA &bull; Wait &bull; Risk)</span>
            </div>
            <span className="text-[11px] text-[#8A8AA8] font-medium">
              {matchedRoutes.length > 0 ? `${matchedRoutes.length} direct options` : 'All corridors'}
            </span>
          </div>

          <div className="space-y-2">
            {(matchedRoutes.length > 0 ? matchedRoutes : routes).map((r) => {
              const isSelected = r.id === selectedRouteId;
              const aiBadge = getBadgeForRoute(r.id);
              const delayInfo = getDelayForRoute(r.id);

              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRouteId(r.id)}
                  className={`saas-card p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-[#8B5CF6] shadow-soft-hover'
                      : 'hover:shadow-soft-hover'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: r.color }}
                      ></span>
                      <span className="font-bold text-xs text-[#1B1B3A]">
                        {r.name}
                      </span>
                      {/* AI Ranking Badge: Safest, Fastest, Balanced */}
                      {aiBadge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            aiBadge === 'Safest'
                              ? 'bg-[#DDF8EA] text-[#16A34A] border border-[#16A34A]/20'
                              : aiBadge === 'Fastest'
                              ? 'bg-[#EBF5FF] text-[#3B82F6] border border-[#3B82F6]/20'
                              : 'bg-[#ECEAF8] text-[#8B5CF6] border border-[#8B5CF6]/20'
                          }`}
                        >
                          {aiBadge}
                        </span>
                      )}
                    </div>

                    {/* Status Chip */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'On Time'
                          ? 'bg-[#DDF8EA] text-[#16A34A]'
                          : r.status === 'Delayed'
                          ? 'bg-[#FFE9D6] text-[#EA580C]'
                          : 'bg-[#FFF1F2] text-[#FF4D4F]'
                      }`}
                    >
                      {r.status} {r.delay_minutes > 0 ? `(+${r.delay_minutes}m)` : ''}
                    </span>
                  </div>

                  {/* Delay Prediction Banner */}
                  {delayInfo && (
                    <div className="mt-1.5 flex items-center justify-between text-[10px] py-1 px-2 rounded-lg bg-[#F8F7FD]">
                      <span className="text-[#1B1B3A] font-medium">
                        {delayInfo.is_delayed ? (
                          <span className="text-[#EA580C] font-semibold">
                            Next vehicle likely {delayInfo.predicted_delay_minutes} min late
                          </span>
                        ) : (
                          <span className="text-[#16A34A] font-semibold">
                            Next vehicle likely on schedule
                          </span>
                        )}
                      </span>
                      <span className="text-[#8A8AA8]">
                        Confidence: <strong className="text-[#1B1B3A]">{delayInfo.confidence_pct}%</strong>
                      </span>
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#8A8AA8]">
                    <span>Next departure: <strong className="text-[#1B1B3A]">{r.next_departure_in_min || 12} mins</strong></span>
                    <span>Trip duration: <strong className="text-[#1B1B3A]">{r.base_duration_min}m</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best Time to Leave Suggestion */}
        {bestTime && (
          <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#DDF8EA] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-[#15803D]">
                  Best time to leave: {bestTime.recommended_slot}
                </div>
                <div className="text-[11px] text-[#166534] mt-0.5">
                  {bestTime.summary}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white text-[#16A34A] text-[10px] font-bold border border-[#DCFCE7] shrink-0 shadow-xs">
              AI Optimized
            </span>
          </div>
        )}

        {/* AI Risk Score Card with "Why?" Explanation Button */}
        {riskData && (
          <div className="saas-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-xs font-bold text-[#1B1B3A]">
                  AI safety risk scoring
                </span>
                <button
                  onClick={() => setShowWhyModal(true)}
                  className="px-2 py-0.5 rounded-full bg-[#ECEAF8] hover:bg-[#DDD8F8] text-[#8B5CF6] text-[10px] font-bold flex items-center gap-1 transition"
                  title="View explainable AI factors"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>Why?</span>
                </button>
              </div>

              {/* Risk Tier Badge */}
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  riskData.risk_tier === 'Low'
                    ? 'bg-[#DDF8EA] text-[#16A34A]'
                    : riskData.risk_tier === 'Medium'
                    ? 'bg-[#FFE9D6] text-[#EA580C]'
                    : 'bg-[#FFF1F2] text-[#FF4D4F]'
                }`}
              >
                <span>{riskData.risk_tier} risk</span>
                <span className="text-[11px] font-mono">({riskData.risk_score}/100)</span>
              </div>
            </div>

            {/* Progress Meter */}
            <div className="h-2 w-full bg-[#EAE9F2] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${riskData.risk_score}%`,
                  backgroundColor: riskData.tier_color || '#8B5CF6',
                }}
              ></div>
            </div>

            {/* Top 3 Contributing Factors */}
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#8A8AA8]">
                <span>Top 3 AI risk drivers:</span>
                <span className="text-[10px] text-[#8B5CF6] cursor-pointer hover:underline" onClick={() => setShowWhyModal(true)}>
                  Inspect model &bull;
                </span>
              </div>
              {riskData.top_factors?.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-[#1B1B3A]">
                  <span className="text-[#8B5CF6] font-bold">&bull;</span>
                  <span className="leading-snug">{factor}</span>
                </div>
              ))}
            </div>

            {/* Corridor specs */}
            <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-[10px] text-center">
              <div className="p-2 rounded-xl bg-[#F8F7FD]">
                <div className="text-[#8A8AA8]">CCTV</div>
                <div className="text-[#16A34A] font-bold mt-0.5">
                  {riskData.metrics?.cctv_active ? 'Active' : 'No'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-[#F8F7FD]">
                <div className="text-[#8A8AA8]">Crowd</div>
                <div className="text-[#1B1B3A] font-bold mt-0.5">
                  {riskData.metrics?.crowd_level}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-[#F8F7FD]">
                <div className="text-[#8A8AA8]">Lighting</div>
                <div className="text-[#16A34A] font-bold mt-0.5">
                  {riskData.metrics?.lighting}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Automatic Alternative Route Suggestion on Disruption */}
        {activeRoute && (activeRoute.status === 'Disrupted' || (activeRoute.delay_minutes || 0) >= 15) && alternatives.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-[#FF4D4F]/20 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#FF4D4F]">
              <AlertCircle className="w-4 h-4" />
              <span>Route disruption detected &bull; Automatic alternative</span>
            </div>
            <p className="text-xs text-[#8A8AA8]">
              {activeRoute.name} has heavy delays or service disruption. NightShield suggests switching to a safer, running corridor:
            </p>
            <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-[#1B1B3A]">{alternatives[0].route_name}</div>
                <div className="text-[11px] text-[#16A34A] font-medium">On Time &bull; Risk: {alternatives[0].risk_tier} ({alternatives[0].risk_score}/100)</div>
              </div>
              <button
                onClick={() => {
                  setSelectedRouteId(alternatives[0].route_id);
                  addNotification('Alternative adopted', `Switched to ${alternatives[0].route_name}`, 'success');
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold transition shadow-sm"
              >
                Accept
              </button>
            </div>
          </div>
        )}

        {/* Smart Route Suggestions (Safer Alternatives) */}
        {alternatives.length > 0 && (
          <div className="saas-card p-5 space-y-3 bg-gradient-to-br from-white to-[#FFF9F5] border border-[#FFE9D6]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#EA580C]">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                <span>Safer alternative route suggestions</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#DDF8EA] text-[#16A34A] text-[10px] font-bold">
                Available
              </span>
            </div>

            <div className="space-y-2">
              {alternatives.slice(0, 2).map((alt) => (
                <div
                  key={alt.route_id}
                  className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="font-bold text-xs text-[#1B1B3A]">
                      {alt.route_name}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {alt.badges?.map((b, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-[#ECEAF8] text-[#8B5CF6] text-[9px] font-bold"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] text-[#8A8AA8]">
                      Wait: <strong>{alt.wait_time_min}m</strong> &bull; ETA: <strong>{alt.total_eta_min}m</strong> &bull; Risk: <strong>{alt.risk_tier} ({alt.risk_score})</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedRouteId(alt.route_id);
                      addNotification('Route switched', `Switched to ${alt.route_name}`, 'info');
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold shrink-0 shadow-sm transition"
                  >
                    Switch
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Journey CTA Button */}
        <button
          onClick={handleStartJourney}
          disabled={loadingStart}
          className="w-full py-3.5 rounded-full gradient-violet-blue text-white text-xs font-bold tracking-wide shadow-btn flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Start journey & share live progress</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>

      {/* Right Map Canvas */}
      <div className="flex-1 h-[450px] lg:h-auto min-h-[420px]">
        <MapView
          selectedRouteId={selectedRouteId}
          highlightStops={[originId, destId]}
          className="w-full h-full"
        />
      </div>

      {/* "Why?" Explainable AI Modal */}
      {showWhyModal && riskData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-[26px] p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
                <h3 className="font-bold text-sm text-[#1B1B3A]">AI Risk Score Breakdown</h3>
              </div>
              <button
                onClick={() => setShowWhyModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-[#8A8AA8] flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#8A8AA8] leading-relaxed">
              NightShield's RandomForest model evaluates 7 empirical features derived from 2,500 historical late-night commutes:
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-[#F8F7FD] rounded-xl border border-slate-100 text-xs">
                <div className="flex justify-between font-bold text-[#1B1B3A]">
                  <span>Late-Night Hour Multiplier</span>
                  <span className="text-[#8B5CF6]">Weight: 2.8x</span>
                </div>
                <div className="text-[11px] text-[#8A8AA8] mt-0.5">
                  Commute windows between 01:00 AM - 04:00 AM receive heightened isolation weighting.
                </div>
              </div>

              <div className="p-3 bg-[#F8F7FD] rounded-xl border border-slate-100 text-xs">
                <div className="flex justify-between font-bold text-[#1B1B3A]">
                  <span>Platform Waiting Vulnerability</span>
                  <span className="text-[#EA580C]">
                    {riskData.metrics?.delay_minutes > 10 ? 'High' : 'Normal'} ({riskData.metrics?.delay_minutes || 0}m delay)
                  </span>
                </div>
                <div className="text-[11px] text-[#8A8AA8] mt-0.5">
                  Extended waiting at low-frequency stops increases risk proportionally.
                </div>
              </div>

              <div className="p-3 bg-[#F8F7FD] rounded-xl border border-slate-100 text-xs">
                <div className="flex justify-between font-bold text-[#1B1B3A]">
                  <span>Infrastructure & Presence</span>
                  <span className="text-[#16A34A]">Lighting: {riskData.metrics?.lighting}</span>
                </div>
                <div className="text-[11px] text-[#8A8AA8] mt-0.5">
                  High lighting, active CCTV, and crowd volume offset platform isolation by up to 15 points.
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#ECEAF8] text-center text-[10px] font-bold text-[#8B5CF6]">
              AI trained on simulated data &bull; Scikit-learn Random Forest (100 estimators)
            </div>

            <button
              onClick={() => setShowWhyModal(false)}
              className="w-full py-2.5 rounded-full gradient-violet-blue text-white text-xs font-bold shadow-btn hover:brightness-110 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
