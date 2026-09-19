import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function NotificationToast() {
  const { notifications, removeNotification } = useApp();

  return (
    <div className="fixed top-20 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => {
        return (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-md shadow-lg flex items-start justify-between gap-3 text-xs transition-all animate-fadeIn ${
              n.type === 'emergency'
                ? 'bg-[#FFF1F2] border-[#FF4D4F]/30 text-[#1B1B3A]'
                : n.type === 'warning'
                ? 'bg-[#FFF9F5] border-[#FFE9D6] text-[#1B1B3A]'
                : n.type === 'success'
                ? 'bg-[#F0FDF4] border-[#DDF8EA] text-[#1B1B3A]'
                : 'bg-white border-slate-100 text-[#1B1B3A]'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0">
                {n.type === 'emergency' ? (
                  <ShieldAlert className="w-4 h-4 text-[#FF4D4F] animate-pulse" />
                ) : n.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
                ) : n.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                ) : (
                  <Info className="w-4 h-4 text-[#8B5CF6]" />
                )}
              </div>

              <div>
                <div className="font-bold text-[#1B1B3A] flex items-center gap-2">
                  <span>{n.title}</span>
                  <span className="text-[10px] text-[#8A8AA8] font-normal">
                    {n.timestamp}
                  </span>
                </div>
                <div className="mt-0.5 leading-snug text-[11px] text-[#8A8AA8]">
                  {n.message}
                </div>
              </div>
            </div>

            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
