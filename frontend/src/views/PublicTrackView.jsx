import React, { useEffect, useState } from 'react';
import { Shield, Clock, Navigation, Phone, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import MapView from '../components/MapView';

export default function PublicTrackView({ token: propToken }) {
  const [token, setToken] = useState(propToken || '');
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let t = propToken;
    if (!t) {
      const match = window.location.pathname.match(/\/track\/([a-zA-Z0-9_-]+)/);
      if (match) {
        t = match[1];
      }
    }
    setToken(t || 'shield_demo');
  }, [propToken]);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const fetchJourney = async () => {
      try {
        const data = await api.share.get(token);
        if (isMounted) {
          setJourney(data);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Live tracking link is invalid, expired, or journey has ended.');
          setLoading(false);
        }
      }
    };

    fetchJourney();
    const interval = setInterval(fetchJourney, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F0FA] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-[#8B5CF6]">Loading live guardian tracking feed...</p>
        </div>
      </div>
    );
  }

  if (error || !journey) {
    return (
      <div className="min-h-screen bg-[#F1F0FA] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 saas-card text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-[#EA580C] mx-auto" />
          <h2 className="text-lg font-bold text-[#1B1B3A]">Tracking session not found</h2>
          <p className="text-xs text-[#8A8AA8]">{error || 'This session is no longer active.'}</p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 rounded-full gradient-violet-blue text-xs font-bold text-white shadow-btn"
          >
            Return to NightShield
          </a>
        </div>
      </div>
    );
  }

  const isSOS = journey.status === 'sos_triggered' || journey.status === 'missed_arrival_alert';
  const currentPos = {
    lat: journey.current_lat || 12.9720,
    lng: journey.current_lng || 77.6010,
  };

  return (
    <div className="min-h-screen bg-[#F1F0FA] text-[#1B1B3A] flex flex-col">
      {/* Top Banner */}
      <header className="h-20 bg-white border-b border-slate-100 px-6 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-pink-violet p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#FF5FA2]" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1B1B3A] flex items-center gap-1.5">
              Night<span className="text-[#8B5CF6]">Shield</span> Guardian view
            </h1>
            <p className="text-[11px] text-[#8A8AA8]">
              Live telemetry feed for {journey.commuter_name}
            </p>
          </div>
        </div>

        <span className="px-3.5 py-1.5 bg-[#DDF8EA] text-[#16A34A] rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
          Live guardian feed
        </span>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-6 gap-6">
        
        {/* Left Status Column */}
        <div className="w-full lg:w-[420px] space-y-4">
          
          {/* Status Card */}
          <div
            className={`saas-card p-6 space-y-4 ${
              isSOS ? 'ring-2 ring-[#FF4D4F]' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#8A8AA8]">
                Commuter status
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isSOS
                    ? 'bg-[#FFF1F2] text-[#FF4D4F]'
                    : 'bg-[#DDF8EA] text-[#16A34A]'
                }`}
              >
                {isSOS ? 'Emergency dispatched' : 'On route &bull; Safe'}
              </span>
            </div>

            <div>
              <div className="text-xl font-extrabold text-[#1B1B3A]">
                {journey.commuter_name}
              </div>
              <div className="text-xs text-[#8A8AA8] mt-0.5">
                Traveling via {journey.route?.name || 'Metro Transit'}
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-xs text-[#8A8AA8] mb-1">
                <span>Journey progress:</span>
                <span className="font-bold text-[#8B5CF6]">{journey.progress_pct}%</span>
              </div>
              <div className="h-2.5 w-full bg-[#EAE9F2] rounded-full overflow-hidden">
                <div
                  className="h-full gradient-violet-blue rounded-full transition-all duration-300"
                  style={{ width: `${journey.progress_pct}%` }}
                ></div>
              </div>
            </div>

            {/* Stops */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8A8AA8]">Origin:</span>
                <span className="font-bold text-[#1B1B3A]">{journey.origin_stop?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A8AA8]">Destination:</span>
                <span className="font-bold text-[#1B1B3A]">{journey.dest_stop?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8A8AA8]">ETA window:</span>
                <span className="font-bold text-[#8B5CF6]">{journey.eta_minutes} mins</span>
              </div>
            </div>
          </div>

          {/* Nearest Help Points */}
          <div className="saas-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-[#1B1B3A] flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#8B5CF6]" /> Nearest emergency safe havens
            </h4>

            {journey.nearest_help_points?.map((hp) => (
              <div key={hp.id} className="p-3 bg-[#F8F7FD] rounded-2xl flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-[#1B1B3A]">{hp.name}</div>
                  <div className="text-[11px] text-[#8A8AA8]">{hp.distance_formatted} away &bull; {hp.operating_hours}</div>
                </div>
                <a
                  href={`tel:${hp.phone.replace(/[^0-9+]/g, '')}`}
                  className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-[#1B1B3A] rounded-full text-xs font-bold shadow-sm transition"
                >
                  Call
                </a>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-[#8A8AA8] text-center">
            🔒 This session link is encrypted and will automatically expire upon journey completion.
          </p>

        </div>

        {/* Right Map Canvas */}
        <div className="flex-1 w-full min-h-[70vh] h-[70vh] lg:h-full relative">
          <MapView
            selectedRouteId={journey.route_id}
            userPos={currentPos}
            highlightStops={[journey.origin_stop_id, journey.destination_stop_id]}
            className="w-full h-full"
          />
        </div>

      </div>
    </div>
  );
}
