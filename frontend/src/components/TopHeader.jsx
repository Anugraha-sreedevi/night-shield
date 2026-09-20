import React from 'react';
import { Shield, Clock, Lock, ShieldAlert, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function TopHeader() {
  const { simulatedClock, setPrivacyModalOpen, activeJourney, setActiveTab, triggerSOS, theme, toggleTheme } = useApp();

  return (
    <header className="h-14 sm:h-16 md:h-20 px-3.5 sm:px-6 md:px-8 flex items-center justify-between border-b border-slate-200/50 dark:border-white/5 sticky top-0 z-30 bg-[#F1F0FA]/95 dark:bg-[#0D0D1A]/95 backdrop-blur-md">
      
      {/* Brand with Gradient Mark */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl gradient-pink-violet p-0.5 shadow-md flex items-center justify-center shrink-0">
          <div className="w-full h-full bg-white dark:bg-[#151528] rounded-[10px] sm:rounded-[14px] flex items-center justify-center">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF5FA2]" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-[#1B1B3A] dark:text-[#F4F3FD]">
              Night<span className="text-[#8B5CF6]">Shield</span>
            </h1>
            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-white dark:bg-[#1E1B2E] border border-slate-200 dark:border-white/10 text-[10px] font-semibold text-[#8A8AA8] shadow-xs">
              HarvestHub &bull; SC-03
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#8A8AA8] font-medium hidden sm:block">
            Safer journeys &bull; Smarter transport
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3.5">
        
        {/* Active Journey Indicator */}
        {activeJourney && (
          <button
            onClick={() => setActiveTab('active')}
            className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-[#ECEAF8] dark:bg-[#252044] hover:bg-[#E0DCF5] rounded-full text-[11px] sm:text-xs font-bold text-[#8B5CF6] dark:text-[#A78BFA] flex items-center gap-1 sm:gap-1.5 transition shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse"></span>
            <span className="hidden sm:inline">Active:</span>
            <span>{activeJourney.progress_pct}%</span>
          </button>
        )}

        {/* Simulated Late-Night Clock Pill */}
        <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-[#1E1E38] rounded-full flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-semibold text-[#8A8AA8] shadow-xs border border-slate-200/80 dark:border-white/10">
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8B5CF6]" />
          <span className="text-[#1B1B3A] dark:text-[#F4F3FD] font-bold">{simulatedClock}</span>
          <span className="text-[10px] hidden md:inline">Night</span>
        </div>

        {/* Consent Info Pill (Desktop only to prevent mobile clutter) */}
        <button
          onClick={() => setPrivacyModalOpen(true)}
          className="hidden sm:flex px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-[#DDF8EA] dark:bg-[#153422] hover:bg-[#CEF4DE] rounded-full items-center gap-1 sm:gap-1.5 text-xs text-[#16A34A] dark:text-[#34D399] font-bold transition shadow-xs"
          title="Security & consent policy"
        >
          <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#16A34A] dark:text-[#34D399]" />
          <span className="hidden md:inline">Consent</span>
        </button>

        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 sm:w-auto sm:px-3 sm:py-1.5 bg-white hover:bg-slate-50 dark:bg-[#1E1E38] dark:hover:bg-[#252446] rounded-full flex items-center justify-center sm:gap-1.5 text-xs font-bold text-[#1B1B3A] dark:text-[#F3F2FD] shadow-xs border border-slate-200/80 dark:border-white/10 transition active:scale-95"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="hidden sm:inline text-[11px]">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span className="hidden sm:inline text-[11px]">Dark</span>
            </>
          )}
        </button>

        {/* Coral-Red SOS Button */}
        <button
          onClick={() => triggerSOS()}
          className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full bg-[#FF4D4F] hover:bg-[#E03E40] text-white text-[11px] sm:text-xs font-extrabold tracking-wide shadow-coral-glow flex items-center gap-1 sm:gap-1.5 active:scale-95 transition cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">SOS emergency</span>
          <span className="sm:hidden">SOS</span>
        </button>

      </div>

    </header>
  );
}
