import React, { useState, useEffect } from 'react';
import { MessageSquareWarning, Send, ShieldAlert, Lightbulb, Bus, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';

export default function FeedbackView() {
  const { stops, routes, addNotification } = useApp();

  const [category, setCategory] = useState('poor_lighting');
  const [stopId, setStopId] = useState('stop_06');
  const [routeId, setRouteId] = useState('route_n9');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  const categories = [
    { id: 'poor_lighting', label: 'Poor lighting', icon: Lightbulb, color: 'text-[#EA580C]' },
    { id: 'no_bus', label: 'No bus / Long wait', icon: Bus, color: 'text-[#3B82F6]' },
    { id: 'unsafe_stop', label: 'Unsafe stop / Low crowd', icon: AlertOctagon, color: 'text-[#8B5CF6]' },
    { id: 'harassment', label: 'Harassment / Suspicious', icon: ShieldAlert, color: 'text-[#FF4D4F]' },
    { id: 'other', label: 'Other concern', icon: MessageSquareWarning, color: 'text-[#16A34A]' },
  ];

  const loadFeedbacks = async () => {
    try {
      const list = await api.feedback.getAll();
      setFeedbacks(list || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      await api.feedback.submit({
        category,
        stop_id: stopId,
        route_id: routeId,
        description: description.trim(),
      });

      addNotification(
        'Safety report submitted',
        'Thank you! Your feedback immediately updates the AI risk model and authority safety grid.',
        'success'
      );
      setDescription('');
      loadFeedbacks();
    } catch (err) {
      addNotification('Submission failed', 'Could not transmit safety concern.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-[#F1F0FA] overflow-y-auto max-w-5xl mx-auto w-full space-y-6">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#8B5CF6] text-xs font-bold">
          <MessageSquareWarning className="w-4 h-4" />
          <span>Crowdsourced safety vigilance</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-[#1B1B3A] mt-1 tracking-tight">
          Report a commute safety concern
        </h2>
        <p className="text-xs text-[#8A8AA8]">
          Your feedback updates AI risk scoring and triggers municipal transit authority work orders.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Report Form */}
        <div className="lg:col-span-6 saas-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#1B1B3A]">
            Log a safety incident or hazard
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Category Selector */}
            <div>
              <label className="text-xs font-semibold text-[#8A8AA8] block mb-2">
                Concern category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition ${
                        isSelected
                          ? 'bg-[#ECEAF8] border-[#8B5CF6] text-[#8B5CF6] font-bold shadow-sm'
                          : 'bg-[#F8F7FD] border-slate-100 text-[#1B1B3A] hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                      <span className="text-xs">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stop Selection */}
            <div>
              <label className="text-xs font-semibold text-[#8A8AA8] block mb-1">
                Associated stop / station
              </label>
              <select
                value={stopId}
                onChange={(e) => setStopId(e.target.value)}
                className="w-full p-2.5 bg-[#F8F7FD] border border-slate-200 rounded-full text-xs font-bold text-[#1B1B3A] focus:outline-none focus:border-[#8B5CF6]"
              >
                {stops.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Route Selection */}
            <div>
              <label className="text-xs font-semibold text-[#8A8AA8] block mb-1">
                Associated line (optional)
              </label>
              <select
                value={routeId}
                onChange={(e) => setRouteId(e.target.value)}
                className="w-full p-2.5 bg-[#F8F7FD] border border-slate-200 rounded-full text-xs font-bold text-[#1B1B3A] focus:outline-none focus:border-[#8B5CF6]"
              >
                {routes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-[#8A8AA8] block mb-1">
                Description of hazard
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe lighting issues, platform isolation, delayed buses, or suspicious activity..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-[#F8F7FD] border border-slate-200 rounded-2xl text-xs text-[#1B1B3A] focus:outline-none focus:border-[#8B5CF6] placeholder:text-[#8A8AA8] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !description.trim()}
              className="w-full py-3 rounded-full gradient-violet-blue text-white text-xs font-bold shadow-btn flex items-center justify-center gap-2 hover:brightness-110 transition"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Transmit safety report'}</span>
            </button>

          </form>
        </div>

        {/* Live Community Feed */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1B1B3A]">
              Recent commuter reports & grid logs
            </h3>
            <span className="text-xs font-bold text-[#8B5CF6]">
              {feedbacks.length} active logs
            </span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {feedbacks.map((f) => (
              <div
                key={f.id}
                className="saas-card p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#ECEAF8] text-[#8B5CF6] font-bold text-[10px]">
                    {f.category?.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-[#8A8AA8] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-[#1B1B3A] leading-relaxed">
                  {f.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#8A8AA8]">
                  <span>Location: <strong className="text-[#1B1B3A]">{f.stop_id}</strong></span>
                  <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
