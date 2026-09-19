import React from 'react';
import { GitBranch, Clock, ShieldCheck, AlertTriangle, ArrowUpRight, Bus } from 'lucide-react';
import { liveRoutesList } from '../mockData';

export default function LiveRoutesView({ onSelectRoute }) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1B1B3A]">
            Live transit routes (5 lines active)
          </h2>
          <p className="text-xs md:text-sm text-[#8A8AA8] mt-0.5">
            Real-time nighttime frequency, corridor delays, and security telemetry.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-white border border-slate-100 text-xs font-semibold text-[#8A8AA8] shadow-sm self-start sm:self-auto">
          Updated 30s ago
        </span>
      </div>

      {/* Routes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {liveRoutesList.map((route) => {
          const isDelayed = route.status === 'Delayed';
          return (
            <div
              key={route.id}
              className="saas-card p-6 flex flex-col justify-between space-y-4 hover:shadow-soft-hover transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-sm text-white shadow-sm"
                      style={{ backgroundColor: route.color }}
                    >
                      {route.code}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1B1B3A]">
                        {route.name}
                      </h3>
                      <div className="text-xs text-[#8A8AA8] mt-0.5">
                        {route.frequency} &bull; {route.activeVehicles} vehicles active
                      </div>
                    </div>
                  </div>

                  {/* Status Chip */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                      route.statusType === 'mint'
                        ? 'bg-[#DDF8EA] text-[#16A34A]'
                        : 'bg-[#FFE9D6] text-[#EA580C]'
                    }`}
                  >
                    {isDelayed ? <AlertTriangle className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    <span>{route.status} {route.delayMins > 0 ? `(+${route.delayMins}m)` : ''}</span>
                  </span>
                </div>

                {/* Stops sequence */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-[#8A8AA8] mb-1.5">
                    Stops corridor
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {route.stops.map((stop, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#F8F7FD] rounded-full text-[11px] text-[#1B1B3A] font-medium"
                      >
                        {stop}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[#8A8AA8]">Safety reliability index:</span>
                <span className="font-bold text-[#16A34A]">{route.safetyRating}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
