import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Clock, 
  Users, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  Radio, 
  FileText,
  ArrowUpRight,
  MapPin,
  ShieldCheck,
  Zap,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { api } from '../api/client';

export default function AuthorityView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logFilter, setLogFilter] = useState('ALL');
  const [clusterFilter, setClusterFilter] = useState('ALL');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.authority.getAnalytics();
        setData(res);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load authority analytics:', err);
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F1F0FA]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-[#8B5CF6]">Aggregating transit authority safety grid...</p>
        </div>
      </div>
    );
  }

  const filteredLogs = data.emergency_audit_log?.filter((log) => {
    if (logFilter === 'ALL') return true;
    return log.event_type === logFilter;
  }) || [];

  const filteredHotspots = data.hotspots?.filter((h) => {
    if (clusterFilter === 'ALL') return true;
    return h.cluster_id === parseInt(clusterFilter);
  }) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-8 pb-12 bg-[#F1F0FA] w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[#8B5CF6] text-xs font-bold">
            <Radio className="w-4 h-4 text-[#16A34A] animate-pulse" />
            <span>Transit safety command center</span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECEAF8] text-[#8B5CF6] text-[10px] font-bold border border-[#8B5CF6]/20 ml-2">
              AI trained on simulated data
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1B1B3A] mt-1 tracking-tight">
            Authority safety & fleet analytics
          </h2>
          <p className="text-xs text-[#8A8AA8]">
            Real-time urban surveillance, Scikit-learn KMeans hotspot clustering, and dispatch intervention triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-bold text-[#8B5CF6] shadow-sm">
            {data.city_name}
          </span>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="saas-card p-5">
          <div className="flex items-center justify-between text-[#8A8AA8] text-xs font-semibold">
            <span>Peak delay window</span>
            <Clock className="w-4 h-4 text-[#EA580C]" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-[#1B1B3A] mt-2">
            24.0 <span className="text-xs font-medium text-[#8A8AA8]">min avg</span>
          </div>
          <div className="text-[11px] text-[#8A8AA8] mt-1">01:00 AM - 02:00 AM corridor</div>
        </div>

        <div className="saas-card p-5">
          <div className="flex items-center justify-between text-[#8A8AA8] text-xs font-semibold">
            <span>Fleet night reliability</span>
            <Activity className="w-4 h-4 text-[#16A34A]" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-[#16A34A] mt-2">
            86.4%
          </div>
          <div className="text-[11px] text-[#8A8AA8] mt-1">4 of 5 routes operating on-schedule</div>
        </div>

        <div className="saas-card p-5">
          <div className="flex items-center justify-between text-[#8A8AA8] text-xs font-semibold">
            <span>KMeans stop clusters</span>
            <Layers className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-[#8B5CF6] mt-2">
            3 <span className="text-xs font-medium text-[#8A8AA8]">safety tiers</span>
          </div>
          <div className="text-[11px] text-[#8A8AA8] mt-1">Classified by delay & incidents</div>
        </div>

        <div className="saas-card p-5">
          <div className="flex items-center justify-between text-[#8A8AA8] text-xs font-semibold">
            <span>Escalations & SOS</span>
            <ShieldAlert className="w-4 h-4 text-[#FF4D4F]" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-[#FF4D4F] mt-2">
            {data.emergency_audit_log?.length || 2}
          </div>
          <div className="text-[11px] text-[#8A8AA8] mt-1">Dispatched to emergency responders</div>
        </div>

      </div>

      {/* Feature 10 Part 1: KMeans Hotspot Map & Clustering */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-[#1B1B3A] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
              AI Stop Vulnerability Hotspot Clustering (KMeans)
            </h3>
            <p className="text-[11px] text-[#8A8AA8] mt-0.5">
              Stops unsupervised-clustered by delay minutes, night incident frequency, and platform lighting index.
            </p>
          </div>

          <div className="flex gap-1.5 text-xs">
            {[
              { label: 'All Stops', val: 'ALL' },
              { label: 'Hotspots (Cluster 2)', val: '2' },
              { label: 'Monitored Hubs (Cluster 1)', val: '1' },
              { label: 'Standard Safe (Cluster 0)', val: '0' },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => setClusterFilter(f.val)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                  clusterFilter === f.val
                    ? 'bg-[#8B5CF6] text-white shadow-xs'
                    : 'bg-[#F8F7FD] text-[#8A8AA8] hover:text-[#1B1B3A]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hotspot Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredHotspots.map((h) => {
            const isHotspot = h.cluster_id === 2;
            const isHub = h.cluster_id === 1;

            return (
              <div
                key={h.stop_id}
                className={`p-4 rounded-2xl border transition ${
                  isHotspot
                    ? 'bg-[#FFF1F2]/60 border-[#FF4D4F]/30'
                    : isHub
                    ? 'bg-[#ECEAF8]/40 border-[#8B5CF6]/30'
                    : 'bg-[#F8F7FD] border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#1B1B3A]">{h.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      isHotspot
                        ? 'bg-[#FFF1F2] text-[#FF4D4F] border border-[#FF4D4F]/30'
                        : isHub
                        ? 'bg-[#ECEAF8] text-[#8B5CF6] border border-[#8B5CF6]/30'
                        : 'bg-[#DDF8EA] text-[#16A34A] border border-[#16A34A]/30'
                    }`}
                  >
                    {h.cluster_label}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-[#8A8AA8]">
                  <div>Incident: <strong className="text-[#1B1B3A]">{Math.round(h.incident_rate * 100)}%</strong></div>
                  <div>Light: <strong className="text-[#1B1B3A]">{h.lighting_quality}</strong></div>
                  <div>Crowd: <strong className="text-[#1B1B3A]">{h.crowd_level}</strong></div>
                </div>

                <div className="mt-2 text-[10px] text-[#8A8AA8] font-mono">
                  GPS: ({h.lat.toFixed(4)}, {h.lng.toFixed(4)})
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature 10 Part 2: Machine Learning Demand Forecast by Hour */}
      {data.demand_forecast && (
        <div className="saas-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#1B1B3A] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
                Machine Learning Hourly Demand Forecast (21:00 - 04:00)
              </h3>
              <p className="text-[11px] text-[#8A8AA8] mt-0.5">
                Predictive passenger flow model trained to identify transit bottlenecks and underserviced shifts.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#DDF8EA] text-[#16A34A] text-[10px] font-bold">
              GradientBoosting Regressor
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-2">
            {data.demand_forecast.map((fc, i) => (
              <div key={i} className="p-3 bg-[#F8F7FD] rounded-2xl border border-slate-100 text-center space-y-1">
                <div className="text-[11px] font-bold text-[#8B5CF6] font-mono">{fc.hour}</div>
                <div className="text-lg font-black text-[#1B1B3A]">{fc.predicted_riders}</div>
                <div className="text-[9px] text-[#8A8AA8]">riders ({fc.confidence})</div>
                <span
                  className={`inline-block px-1.5 py-0.5 rounded-full text-[8px] font-bold ${
                    fc.capacity_status === 'Optimal'
                      ? 'bg-[#DDF8EA] text-[#16A34A]'
                      : fc.capacity_status === 'Critical Gap'
                      ? 'bg-[#FFF1F2] text-[#FF4D4F]'
                      : 'bg-[#FFE9D6] text-[#EA580C]'
                  }`}
                >
                  {fc.capacity_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature 10 Part 3: Ranked List of Most Underserved Stops with Suggested Actions */}
      {data.underserved_stops && (
        <div className="saas-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#1B1B3A] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
                Ranked Underserved Stops & Prescriptive AI Actions
              </h3>
              <p className="text-[11px] text-[#8A8AA8] mt-0.5">
                Prioritized intervention roster ranked by KMeans vulnerability cluster score and incident probability.
              </p>
            </div>
            <span className="text-xs text-[#8A8AA8] font-medium">
              {data.underserved_stops.length} monitored stops
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[#8A8AA8] text-[11px] font-semibold">
                  <th className="py-3 px-3">Rank & Station</th>
                  <th className="py-3 px-3">Vulnerability Tier</th>
                  <th className="py-3 px-3">Night Incident Rate</th>
                  <th className="py-3 px-3">Lighting / Crowd</th>
                  <th className="py-3 px-3">Prescriptive AI Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.underserved_stops.map((stop, idx) => {
                  const isTopVulnerable = stop.cluster_id === 2;
                  return (
                    <tr key={stop.stop_id} className="hover:bg-[#F8F7FD] transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#1B1B3A] flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-[#8A8AA8] flex items-center justify-center text-[10px]">
                            #{idx + 1}
                          </span>
                          <span>{stop.name}</span>
                        </div>
                        <div className="text-[10px] text-[#8A8AA8] ml-7">{stop.zone}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isTopVulnerable
                              ? 'bg-[#FFF1F2] text-[#FF4D4F]'
                              : stop.cluster_id === 1
                              ? 'bg-[#ECEAF8] text-[#8B5CF6]'
                              : 'bg-[#DDF8EA] text-[#16A34A]'
                          }`}
                        >
                          {stop.cluster_label}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#1B1B3A]">
                        {stop.incident_pct}%
                      </td>
                      <td className="py-3 px-3 text-[#8A8AA8]">
                        Light: <strong className="text-[#1B1B3A]">{stop.lighting}</strong> &bull; Crowd: <strong className="text-[#1B1B3A]">{stop.crowd}</strong>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-[#1B1B3A] font-semibold text-[11px] shadow-2xs inline-block">
                          {stop.suggested_action}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recharts Row 1: Delays by Hour & Demand vs Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Delays by Hour BarChart */}
        <div className="lg:col-span-7 saas-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1B1B3A] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#EA580C]" /> Hourly transit delay trend (Night shift)
            </h3>
            <span className="text-[11px] text-[#8A8AA8] font-mono">20:00 - 05:00</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.delays_by_hour}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F0FA" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8A8AA8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8A8AA8' }} unit="m" />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '16px', 
                    fontSize: '11px',
                    boxShadow: '0 10px 25px rgba(99,102,241,0.12)',
                    border: 'none',
                    color: '#1B1B3A'
                  }}
                />
                <Bar dataKey="avg_delay_min" name="Average delay (Min)" fill="#8B5CF6" radius={[8, 8, 8, 8]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demand vs Capacity AreaChart */}
        <div className="lg:col-span-5 saas-card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#1B1B3A] uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#3B82F6]" /> Route demand vs fleet capacity
            </h3>
            <span className="text-[11px] text-[#3B82F6] font-bold">Riders/Hour</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.demand_by_route}>
                <defs>
                  <linearGradient id="demandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F0FA" />
                <XAxis dataKey="route" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8A8AA8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#8A8AA8' }} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '16px', 
                    fontSize: '11px',
                    boxShadow: '0 10px 25px rgba(99,102,241,0.12)',
                    border: 'none',
                    color: '#1B1B3A'
                  }}
                />
                <Area type="monotone" dataKey="capacity" name="Route capacity" stroke="#EAE9F2" fill="#F8F7FD" />
                <Area type="monotone" dataKey="demand" name="Passenger demand" stroke="#3B82F6" strokeWidth={2.5} fill="url(#demandGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recharts Row 2: Concerns Breakdown & Service Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Reported Concerns Donut */}
        <div className="lg:col-span-5 saas-card p-6 space-y-3">
          <h3 className="text-xs font-bold text-[#1B1B3A] uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-[#8B5CF6]" /> Commuter safety concerns breakdown
          </h3>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.concerns_breakdown}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={76}
                  paddingAngle={4}
                >
                  {data.concerns_breakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderRadius: '16px', 
                    fontSize: '11px',
                    boxShadow: '0 10px 25px rgba(99,102,241,0.12)',
                    border: 'none',
                    color: '#1B1B3A'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-[#8A8AA8]">
            {data.concerns_breakdown?.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.fill }}></span>
                <span className="truncate">{c.name}: <strong className="text-[#1B1B3A]">{c.count}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring Late-Night Service Gaps */}
        <div className="lg:col-span-7 saas-card p-6 space-y-3">
          <h3 className="text-xs font-bold text-[#1B1B3A] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#EA580C]" /> Recurring late-night transit gaps
          </h3>

          <div className="space-y-3">
            {data.service_gaps?.map((gap, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#F8F7FD] rounded-2xl flex items-center justify-between gap-3 border border-slate-100"
              >
                <div>
                  <div className="font-bold text-xs text-[#1B1B3A]">{gap.corridor}</div>
                  <div className="text-[11px] text-[#8A8AA8] mt-0.5">
                    Critical window: <strong className="text-[#8B5CF6] font-mono">{gap.gap_window}</strong>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      gap.severity === 'High'
                        ? 'bg-[#FFF1F2] text-[#FF4D4F]'
                        : 'bg-[#FFE9D6] text-[#EA580C]'
                    }`}
                  >
                    {gap.severity} gap
                  </span>
                  <div className="text-[10px] text-[#8A8AA8] mt-1 font-mono">
                    ~{gap.unmet_riders} unserved riders
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SOS & Missed Arrival Incident Audit Log */}
      <div className="saas-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-[#1B1B3A] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#8B5CF6]" /> Real-time SOS & missed-arrival event audit log
          </h3>

          <div className="flex gap-2 text-xs">
            {['ALL', 'SOS', 'MISSED_ARRIVAL'].map((t) => (
              <button
                key={t}
                onClick={() => setLogFilter(t)}
                className={`px-3 py-1 rounded-full font-bold text-[11px] transition ${
                  logFilter === t
                    ? 'bg-[#1B1B3A] text-white'
                    : 'bg-[#F8F7FD] text-[#8A8AA8] hover:text-[#1B1B3A]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[#8A8AA8] text-[11px] font-semibold">
                <th className="py-3 px-3">Event ID</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Dispatched payload</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8F7FD] transition">
                  <td className="py-3 px-3 font-mono text-[#8B5CF6] font-bold">{log.id}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        log.event_type === 'SOS'
                          ? 'bg-[#FFF1F2] text-[#FF4D4F]'
                          : 'bg-[#FFE9D6] text-[#EA580C]'
                      }`}
                    >
                      {log.event_type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[#1B1B3A] font-medium">{log.location_name}</td>
                  <td className="py-3 px-3 text-[#8A8AA8] max-w-xs truncate font-mono text-[11px]">
                    {log.message}
                  </td>
                  <td className="py-3 px-3 text-[#8A8AA8] font-mono text-[11px]">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-[#16A34A] font-bold text-[11px]">
                      Dispatched
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
