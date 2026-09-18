import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Users, 
  Sparkles, 
  Check, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import ProgressRing from '../components/ProgressRing';
import { 
  lateNightDelaysData, 
  routeReliabilityData, 
  initialActiveJourney, 
  aiRiskAssessment, 
  waitingTimeData, 
  initialContacts 
} from '../mockData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid 
} from 'recharts';

export default function DashboardView({ onNavigateToLiveJourney, contacts, setContacts }) {
  const [activeJourney, setActiveJourney] = useState(initialActiveJourney);
  const [riskData, setRiskData] = useState(aiRiskAssessment);
  const [waitData, setWaitData] = useState(waitingTimeData);

  const toggleNotified = (id) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, notified: !c.notified } : c));
  };

  const toggleLiveShare = (id) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, liveShare: !c.liveShare } : c));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Top Welcome & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1B1B3A]">
            Night journey overview
          </h2>
          <p className="text-xs md:text-sm text-[#8A8AA8] mt-0.5">
            Real-time transit telemetry, proactive AI risk evaluation, and guardian sync.
          </p>
        </div>

        {/* Positive Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#DDF8EA] rounded-full text-xs font-bold text-[#16A34A] self-start md:self-auto shadow-sm">
          <ArrowUpRight className="w-4 h-4" />
          <span>All safety monitors operational</span>
        </div>
      </div>

      {/* Row 1: 3 Core Metric Cards (Journey Status, AI Risk Level, Waiting Time) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Journey Status Card */}
        <div className="saas-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#1B1B3A]">
              Journey status
            </h3>
            <span className="px-3 py-1 rounded-full bg-[#ECEAF8] text-xs font-semibold text-[#8B5CF6]">
              {activeJourney.routeCode}
            </span>
          </div>

          <div className="my-4 flex items-center justify-center">
            <ProgressRing
              percentage={activeJourney.progressPct}
              size={136}
              strokeWidth={13}
              gradientType="pink-violet"
              centerLabel={`${activeJourney.progressPct}%`}
              centerSub="completed"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div>
              <div className="text-[11px] text-[#8A8AA8]">Next stop</div>
              <div className="font-bold text-[#1B1B3A] truncate max-w-[160px]">
                {activeJourney.nextStop}
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] text-[#8A8AA8]">Expected arrival</div>
              <div className="font-bold text-[#8B5CF6]">
                {activeJourney.etaMinutes} min ({activeJourney.expectedArrivalTime})
              </div>
            </div>
          </div>
        </div>

        {/* 2. Risk Level Card */}
        <div className="saas-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#1B1B3A]">
              AI risk assessment
            </h3>
            <span className="px-3 py-1 rounded-full bg-[#DDF8EA] text-xs font-bold text-[#16A34A] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
              {riskData.level} risk
            </span>
          </div>

          <div className="my-4 flex items-center justify-center">
            <ProgressRing
              percentage={riskData.score}
              size={136}
              strokeWidth={13}
              gradientType="violet-blue"
              centerLabel={`${riskData.score}`}
              centerSub="index / 100"
            />
          </div>

          {/* Plain language reasons */}
          <div className="pt-3 border-t border-slate-100 space-y-1">
            <div className="text-[11px] font-semibold text-[#8A8AA8]">
              Contributing safety factors
            </div>
            <div className="text-xs text-[#1B1B3A] space-y-1">
              {riskData.factors.slice(0, 2).map((factor, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"></span>
                  <span className="truncate">{factor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Waiting Time Card */}
        <div className="saas-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#1B1B3A]">
              Next departure
            </h3>
            <span className="text-xs text-[#8A8AA8] font-medium">
              Live estimate
            </span>
          </div>

          <div className="my-4 text-center">
            <div className="text-5xl font-extrabold text-[#1B1B3A] tracking-tight">
              {waitData.waitMinutes} <span className="text-lg font-semibold text-[#8A8AA8]">min</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#DDF8EA] text-[#16A34A] text-xs font-bold rounded-full mt-3">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{waitData.trend}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[#8A8AA8]">Following departures</span>
            <div className="flex gap-2 text-xs font-bold text-[#1B1B3A]">
              {waitData.nextArrivals.map((arr, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-100 rounded-full text-[11px]">
                  {arr}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Charts (Late-Night Delays & Route Reliability) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Late-Night Delays Chart (Like Monthly Stats) */}
        <div className="lg:col-span-7 saas-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-[#1B1B3A]">
                Late-night delays by hour
              </h3>
              <p className="text-xs text-[#8A8AA8]">
                Average minutes delayed from 9 PM to 5 AM (This week vs last week)
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-[#8A8AA8] self-start sm:self-auto">
              Hourly stats
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lateNightDelaysData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F0FA" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8A8AA8', fontSize: 11, fontWeight: 500 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  unit="m" 
                  tick={{ fill: '#8A8AA8', fontSize: 11, fontWeight: 500 }} 
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 240, 250, 0.6)' }}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(99,102,241,0.15)',
                    border: 'none',
                    fontSize: '12px',
                    color: '#1B1B3A'
                  }}
                />
                {/* Light-grey previous period series */}
                <Bar 
                  dataKey="lastWeek" 
                  name="Last week average" 
                  fill="#EAE9F2" 
                  radius={[8, 8, 8, 8]} 
                  barSize={10} 
                />
                {/* Dual series with rounded caps: pink and violet */}
                <Bar 
                  dataKey="thisWeekPink" 
                  name="Line 1 Metro" 
                  fill="#FF5FA2" 
                  radius={[8, 8, 8, 8]} 
                  barSize={10} 
                />
                <Bar 
                  dataKey="thisWeekViolet" 
                  name="Line 4 Cruiser" 
                  fill="#8B5CF6" 
                  radius={[8, 8, 8, 8]} 
                  barSize={10} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend chips under chart */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-[#8A8AA8]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5FA2]"></span>
              <span>Line 1 Metro</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#8B5CF6]"></span>
              <span>Line 4 Midnight</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#EAE9F2]"></span>
              <span>Last week baseline</span>
            </div>
          </div>
        </div>

        {/* Route Reliability Area Chart (Like Data Graph Analysis) */}
        <div className="lg:col-span-5 saas-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#1B1B3A]">
                Route reliability index
              </h3>
              <p className="text-xs text-[#8A8AA8]">
                System performance curve across the night
              </p>
            </div>
            <span className="px-3 py-1 bg-[#DDF8EA] text-[#16A34A] text-xs font-bold rounded-full">
              92.4% avg
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={routeReliabilityData}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F0FA" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8A8AA8', fontSize: 11 }} 
                />
                <YAxis 
                  domain={[60, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  unit="%" 
                  tick={{ fill: '#8A8AA8', fontSize: 11 }} 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(99,102,241,0.15)',
                    border: 'none',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="reliability" 
                  name="Reliability %" 
                  stroke="#8B5CF6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#areaGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center text-xs text-[#8A8AA8]">
            Optimal reliability corridor: <strong>9 PM - 11 PM</strong> &bull; Lowest at <strong>1 AM</strong>
          </div>
        </div>

      </div>

      {/* Row 3: Trusted Contacts Checklist & Quick CTA to Live Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Trusted Contacts Checklist Card */}
        <div className="lg:col-span-8 saas-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#1B1B3A]">
                Trusted contacts checklist
              </h3>
              <p className="text-xs text-[#8A8AA8]">
                Guardians synced with your journey for auto-notification and missed arrival alerts
              </p>
            </div>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-semibold text-[#8A8AA8]">
              {contacts.length} guardians
            </span>
          </div>

          {/* List of contacts with numbered tinted badges */}
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3.5 bg-[#F8F7FD] hover:bg-slate-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
              >
                <div className="flex items-center gap-3">
                  {/* Tinted Number Badge */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${contact.badgeColor}`}>
                    {contact.badgeNumber}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-[#1B1B3A] flex items-center gap-2">
                      <span>{contact.name}</span>
                      <span className="text-[11px] font-medium text-[#8A8AA8]">({contact.relation})</span>
                    </div>
                    <div className="text-[11px] text-[#8A8AA8] font-mono mt-0.5">
                      {contact.phone}
                    </div>
                  </div>
                </div>

                {/* Toggles & Checkboxes */}
                <div className="flex items-center gap-4 text-xs">
                  {/* Notified Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={contact.notified}
                      onChange={() => toggleNotified(contact.id)}
                      className="w-4 h-4 rounded-full text-[#8B5CF6] focus:ring-0 border-slate-300"
                    />
                    <span className="text-[11px] font-medium text-[#1B1B3A]">Notified</span>
                  </label>

                  {/* Live Share Switch */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={contact.liveShare}
                      onChange={() => toggleLiveShare(contact.id)}
                      className="w-4 h-4 rounded-full text-[#16A34A] focus:ring-0 border-slate-300"
                    />
                    <span className="text-[11px] font-medium text-[#1B1B3A]">Live progress</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Card: Open Safety Map */}
        <div className="lg:col-span-4 saas-card p-6 flex flex-col justify-between space-y-4 bg-gradient-to-br from-white to-[#F8F7FD]">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#DDF8EA] flex items-center justify-center text-[#16A34A] mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#1B1B3A]">
              Live journey tracking
            </h3>
            <p className="text-xs text-[#8A8AA8] mt-1 leading-relaxed">
              Follow your simulated location dot advancing along the schematic SVG transit line with active missed-arrival escalation.
            </p>
          </div>

          <button
            onClick={onNavigateToLiveJourney}
            className="w-full py-3.5 px-6 rounded-full bg-[#1B1B3A] hover:bg-[#8B5CF6] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition"
          >
            <span>Open live journey map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
