import React from 'react';
import { Shield, Clock, Lock, ShieldAlert, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TopHeader() {
  const { simulatedClock, setPrivacyModalOpen, activeJourney, setActiveTab, triggerSOS, theme, toggleTheme } = useApp();

  return (
    <header className="h-20 px-6 md:px-8 flex items-center justify-between border-b border-transparent sticky top-0 z-30 bg-transparent">
      
      {/* Brand with Gradient Mark */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl gradient-pink-violet p-0.5 shadow-md flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#FF5FA2]" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-[#1B1B3A]">
              Night<span className="text-[#8B5CF6]">Shield</span>
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-semibold text-[#8A8AA8] shadow-sm">
              HarvestHub &bull; SC-03
            </span>
          </div>
          <p className="text-[11px] text-[#8A8AA8] font-medium hidden sm:block">
            Safer journeys &bull; Smarter transport
          </p>
        </div>
      </div>

      {/* Right Controls: Active Journey Pill, Clock, Consent, and Coral-Red SOS Button */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        
        {/* Active Journey Indicator */}
        {activeJourney && (
          <button
            onClick={() => setActiveTab('active')}
            className="px-3.5 py-1.5 bg-[#ECEAF8] hover:bg-[#E0DCF5] rounded-full text-xs font-bold text-[#8B5CF6] flex items-center gap-1.5 transition shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></span>
            <span className="hidden sm:inline">Active commute:</span>
            <span>{activeJourney.progress_pct}%</span>
          </button>
        )}

        {/* Simulated Late-Night Clock Pill */}
        <div className="px-3.5 py-1.5 bg-white rounded-full flex items-center gap-1.5 text-xs font-semibold text-[#8A8AA8] shadow-sm border border-slate-100">
          <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span className="text-[#1B1B3A] font-bold">{simulatedClock}</span>
          <span className="text-[11px] hidden md:inline">Night</span>
        </div>

        {/* Consent Info Pill */}
        <button
          onClick={() => setPrivacyModalOpen(true)}
          className="px-3.5 py-1.5 bg-[#DDF8EA] hover:bg-[#CEF4DE] rounded-full flex items-center gap-1.5 text-xs text-[#16A34A] font-bold transition shadow-sm"
          title="Security & consent policy"
        >
          <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
          <span className="hidden md:inline">Consent active</span>
        </button>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 dark:bg-[#1E1E38] dark:hover:bg-[#252446] rounded-full flex items-center gap-1.5 text-xs font-bold text-[#1B1B3A] dark:text-[#F3F2FD] shadow-sm border border-slate-200 dark:border-white/10 transition active:scale-95"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Coral-Red SOS Button */}
        <button
          onClick={() => triggerSOS()}
          className="px-4 md:px-5 py-2 rounded-full bg-[#FF4D4F] hover:bg-[#E03E40] text-white text-xs font-extrabold tracking-wide shadow-coral-glow flex items-center gap-1.5 active:scale-95 transition"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>SOS emergency</span>
        </button>

      </div>

    </header>
  );
}
