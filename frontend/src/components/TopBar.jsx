import React from 'react';
import { Shield, Clock, Bell, Search, AlertCircle, Sparkles } from 'lucide-react';

export default function TopBar({ onOpenSOS, missedArrivalActive, simulatedTime = "11:45 PM" }) {
  return (
    <header className="h-20 px-6 md:px-8 flex items-center justify-between border-b border-transparent sticky top-0 z-30 bg-transparent">
      
      {/* Search Field (Pill-shaped) */}
      <div className="relative w-72 md:w-80 hidden sm:block">
        <Search className="w-4 h-4 text-[#8A8AA8] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search stops, routes or safe zones..."
          className="w-full pl-10 pr-4 py-2.5 bg-white rounded-full text-xs font-medium text-[#1B1B3A] placeholder-[#8A8AA8] shadow-sm border border-slate-100 focus:outline-none focus:border-[#8B5CF6]/50 transition"
        />
      </div>

      {/* Center / Status */}
      <div className="flex items-center gap-3">
        {missedArrivalActive && (
          <div className="px-3.5 py-1.5 rounded-full bg-[#FFE9D6] border border-[#EA580C]/20 text-[#EA580C] text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <AlertCircle className="w-4 h-4" />
            <span>Missed arrival detected</span>
          </div>
        )}

        <div className="px-3 py-1.5 rounded-full bg-white text-xs font-semibold text-[#8A8AA8] shadow-sm flex items-center gap-1.5 border border-slate-100">
          <Clock className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span className="text-[#1B1B3A] font-bold">{simulatedTime}</span>
          <span className="hidden md:inline text-[11px]">• Night commute</span>
        </div>
      </div>

      {/* Right Controls: Coral-Red SOS Button & Profile */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Large, Always-Visible Coral-Red SOS Button */}
        <button
          onClick={onOpenSOS}
          className="px-5 py-2.5 rounded-full bg-[#FF4D4F] hover:bg-[#E03E40] text-white text-xs font-extrabold tracking-wide shadow-coral-glow flex items-center gap-2 active:scale-95 transition"
        >
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>SOS emergency</span>
        </button>

        {/* Profile Avatar Pill */}
        <div className="hidden lg:flex items-center gap-2.5 p-1 pl-3 bg-white rounded-full shadow-sm border border-slate-100">
          <div className="text-right">
            <div className="text-xs font-bold text-[#1B1B3A]">Elena Rostova</div>
            <div className="text-[10px] text-[#8A8AA8]">Safe commute active</div>
          </div>
          <div className="w-8 h-8 rounded-full gradient-pink-violet p-0.5 shadow-sm">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-xs text-[#8B5CF6]">
              ER
            </div>
          </div>
        </div>

      </div>

    </header>
  );
}
