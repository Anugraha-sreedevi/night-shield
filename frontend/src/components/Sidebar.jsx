import React from 'react';
import { 
  Compass, 
  Navigation, 
  Users, 
  MessageSquareWarning, 
  BarChart3, 
  Sparkles, 
  ShieldCheck, 
  Radio,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { activeTab, setActiveTab, activeJourney, contacts } = useApp();

  const navItems = [
    { id: 'plan', label: 'Plan journey', icon: Compass, badge: null },
    { id: 'active', label: 'Live journey', icon: Navigation, badge: activeJourney ? 'Live' : null, badgeColor: 'bg-[#3B82F6] text-white' },
    { id: 'contacts', label: 'Trusted contacts', icon: Users, badge: contacts.length ? `${contacts.length}` : null, badgeColor: 'bg-[#FF5FA2] text-white' },
    { id: 'feedback', label: 'Safety feedback', icon: MessageSquareWarning, badge: null },
    { id: 'authority', label: 'Authority dashboard', icon: BarChart3, badge: 'Live', badgeColor: 'bg-[#1B1B3A] text-white' },
    { id: 'roadmap', label: 'Future roadmap', icon: Sparkles, badge: 'AI', badgeColor: 'bg-[#8B5CF6] text-white' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white rounded-card m-4 mr-0 p-5 shadow-soft border border-slate-100 justify-between select-none shrink-0">
      <div>
        
        {/* Pill Search Field */}
        <div className="relative mb-5">
          <Search className="w-3.5 h-3.5 text-[#8A8AA8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search network..."
            className="w-full pl-9 pr-3 py-2 bg-[#F8F7FD] rounded-full text-xs font-medium text-[#1B1B3A] placeholder-[#8A8AA8] border border-slate-100 focus:outline-none focus:border-[#8B5CF6]/50"
          />
        </div>

        {/* Navigation Label */}
        <div className="text-[11px] font-semibold text-[#8A8AA8] px-3 mb-2">
          Safety grid navigation
        </div>

        {/* Nav Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#ECEAF8] text-[#8B5CF6]'
                    : 'text-[#1B1B3A] hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#8B5CF6]' : 'text-[#8A8AA8]'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sub-menu with thin tree lines */}
        <div className="mt-6 pt-4 border-t border-slate-100 px-3">
          <div className="text-[11px] font-semibold text-[#8A8AA8] mb-2">
            Safety monitoring
          </div>
          <div className="pl-2 border-l-2 border-slate-100 space-y-2 text-xs text-[#8A8AA8]">
            <div className="pl-3 hover:text-[#8B5CF6] cursor-pointer flex items-center justify-between">
              <span>Auto-escalation</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
            </div>
            <div className="pl-3 hover:text-[#8B5CF6] cursor-pointer flex items-center justify-between">
              <span>Consent encryption</span>
              <span className="text-[10px] text-[#8A8AA8]">Active</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Status Card */}
      <div className="p-3.5 rounded-2xl bg-[#F8F7FD] border border-slate-100">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1B1B3A]">
          <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
          <span>NightShield Guard</span>
        </div>
        <p className="text-[11px] text-[#8A8AA8] mt-1 leading-snug">
          Real-time AI transit monitoring & automated escalation active.
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-[#8A8AA8]">
          <span className="flex items-center gap-1 text-[#16A34A] font-semibold">
            <Radio className="w-3 h-3 text-[#16A34A] animate-pulse" />
            Air-gapped ML
          </span>
          <span className="font-mono text-[#8B5CF6]">SC-03 V1.0</span>
        </div>
      </div>

    </aside>
  );
}
