import React from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Lock, KeyRound, Server, UserCheck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PrivacyModal() {
  const { privacyModalOpen, setPrivacyModalOpen, user } = useApp();

  if (!privacyModalOpen) return null;

  const privacyPillars = [
    {
      icon: <Lock className="w-5 h-5 text-[#3B82F6]" />,
      title: "Encrypted & ephemeral location",
      desc: "Your GPS coordinates are never sold or broadcast publicly. Tracking is strictly session-bound and encrypted end-to-end.",
    },
    {
      icon: <UserCheck className="w-5 h-5 text-[#16A34A]" />,
      title: "Consent-driven access",
      desc: "Location data is shared solely with the trusted contacts you explicitly designate. You can revoke access or end sharing at any second.",
    },
    {
      icon: <KeyRound className="w-5 h-5 text-[#8B5CF6]" />,
      title: "Zero-knowledge tokenized links",
      desc: "Guardian tracking links use cryptographically secure random tokens. Family members need no login or app installation to view your safe progress.",
    },
    {
      icon: <Server className="w-5 h-5 text-[#EA580C]" />,
      title: "Air-gapped local AI risk modeling",
      desc: "Journey risk scoring is computed locally without transmitting your personal travel history to third-party tracking networks.",
    },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 animate-fadeIn"
      style={{ zIndex: 99999 }}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#151528] rounded-card-lg p-6 md:p-8 shadow-2xl text-[#1B1B3A] dark:text-[#F4F3FD] border border-slate-100 dark:border-white/10"
        style={{ zIndex: 100000 }}
      >
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DDF8EA] text-[#16A34A] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1B1B3A]">Security & privacy architecture</h3>
              <p className="text-xs text-[#8A8AA8]">Consent-based commuter protection</p>
            </div>
          </div>
          <button
            onClick={() => setPrivacyModalOpen(false)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Status Banner */}
        <div className="mt-4 p-3.5 bg-[#F8F7FD] rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
          <div>
            <div className="text-[#8A8AA8]">Authenticated commuter</div>
            <div className="font-bold text-[#1B1B3A]">{user?.full_name} ({user?.email})</div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#DDF8EA] text-[#16A34A] text-[10px] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span> Consent active
          </span>
        </div>

        {/* Pillars */}
        <div className="mt-4 space-y-2.5">
          {privacyPillars.map((p, idx) => (
            <div key={idx} className="flex gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="mt-0.5 shrink-0">{p.icon}</div>
              <div>
                <h4 className="text-xs font-bold text-[#1B1B3A]">{p.title}</h4>
                <p className="text-[11px] text-[#8A8AA8] mt-0.5 leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => setPrivacyModalOpen(false)}
            className="px-6 py-2.5 rounded-full gradient-violet-blue text-white text-xs font-bold shadow-btn hover:brightness-110 transition"
          >
            I understand & agree
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
