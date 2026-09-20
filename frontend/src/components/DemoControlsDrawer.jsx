import React, { useState } from 'react';
import { Sliders, Zap, AlertTriangle, Clock, ShieldAlert, RotateCcw, X, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';

export default function DemoControlsDrawer() {
  const {
    demoDrawerOpen,
    setDemoDrawerOpen,
    simulatedClock,
    triggerMissedArrivalDemo,
    triggerSOS,
    triggerOffRouteCheckIn,
    triggerSuddenStopCheckIn,
    refreshTransitData,
    addNotification,
  } = useApp();

  const [loadingAction, setLoadingAction] = useState(null);

  const handleSimulateDelay = async () => {
    setLoadingAction('delay');
    try {
      await api.demo.delay('route_n9', 25);
      await refreshTransitData();
      addNotification('Demo triggered', 'Injected 25-minute delay on Route N9. Risk score will elevate.', 'warning');
    } catch (e) {
      addNotification('Demo error', 'Could not inject delay', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSimulateDisruption = async () => {
    setLoadingAction('disrupt');
    try {
      await api.demo.disrupt('route_n4');
      await refreshTransitData();
      addNotification('Demo triggered', 'Route N4 marked disrupted. Safer alternatives will surface.', 'warning');
    } catch (e) {
      addNotification('Demo error', 'Could not inject disruption', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFastForward = async () => {
    setLoadingAction('clock');
    try {
      const res = await api.demo.fastForward(15);
      addNotification('Clock advanced', `Advanced 15 minutes. New simulated time: ${res.new_clock}`, 'info');
      await refreshTransitData();
    } catch (e) {
      addNotification('Demo error', 'Could not fast-forward time', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReset = async () => {
    setLoadingAction('reset');
    try {
      await api.demo.reset();
      await refreshTransitData();
      addNotification('Demo reset', 'All routes, vehicles, delays and demo data restored.', 'success');
    } catch (e) {
      addNotification('Demo error', 'Could not reset demo', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      {/* Floating Demo Trigger Button (Pill-shaped, soft shadow) */}
      <button
        onClick={() => setDemoDrawerOpen(true)}
        className="fixed bottom-36 md:bottom-6 right-4 md:right-6 z-[9990] px-4 py-2.5 bg-white dark:bg-[#1A1A32] hover:bg-slate-50 dark:hover:bg-[#222144] border border-slate-200 dark:border-white/10 rounded-full text-[#1B1B3A] dark:text-white font-bold text-xs shadow-lg flex items-center gap-2 backdrop-blur-md transition-all active:scale-95 group cursor-pointer"
        title="Open demo scenario panel"
      >
        <Sliders className="w-4 h-4 text-[#8B5CF6] group-hover:rotate-45 transition-transform" />
        <span className="font-semibold">Demo panel</span>
      </button>

      {/* Slide-out Drawer */}
      {demoDrawerOpen && (
        <div className="fixed inset-0 z-[10000] flex justify-end bg-[#1B1B3A]/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm h-full bg-white p-6 md:p-8 flex flex-col justify-between shadow-2xl text-[#1B1B3A] overflow-y-auto">
            
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#ECEAF8] text-[#8B5CF6] flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1B1B3A]">Judge demo controls</h3>
                    <p className="text-[11px] text-[#8A8AA8]">Live commuter scenarios (&lt; 3 mins)</p>
                  </div>
                </div>
                <button
                  onClick={() => setDemoDrawerOpen(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status readout */}
              <div className="mt-4 p-3 bg-[#F8F7FD] rounded-2xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[#8A8AA8]">Simulated clock:</span>
                  <span className="font-mono font-bold text-[#8B5CF6]">{simulatedClock}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8A8AA8]">Fleet motion:</span>
                  <span className="text-[#16A34A] font-semibold">Real-time simulation</span>
                </div>
              </div>

              {/* Action Buttons (Pill shaped) */}
              <div className="mt-5 space-y-2.5">
                
                {/* 1. Simulate Delay */}
                <button
                  onClick={handleSimulateDelay}
                  disabled={loadingAction === 'delay'}
                  className="w-full p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition flex items-center justify-between shadow-sm group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#1B1B3A] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#EA580C]" /> 1. Simulate route delay (+25m)
                    </div>
                    <div className="text-[11px] text-[#8A8AA8] mt-0.5">
                      Injects 25m delay on Route N9 to elevate risk
                    </div>
                  </div>
                  <span className="text-[#EA580C] font-bold">&rarr;</span>
                </button>

                {/* 2. Simulate Disruption */}
                <button
                  onClick={handleSimulateDisruption}
                  disabled={loadingAction === 'disrupt'}
                  className="w-full p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition flex items-center justify-between shadow-sm group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#1B1B3A] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FF4D4F]" /> 2. Simulate route disruption
                    </div>
                    <div className="text-[11px] text-[#8A8AA8] mt-0.5">
                      Cancels Route N4 to test smart alternatives
                    </div>
                  </div>
                  <span className="text-[#FF4D4F] font-bold">&rarr;</span>
                </button>

                {/* 3. Fast-forward clock */}
                <button
                  onClick={handleFastForward}
                  disabled={loadingAction === 'clock'}
                  className="w-full p-3.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-left transition flex items-center justify-between shadow-sm group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#1B1B3A] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#3B82F6]" /> 3. Fast-forward time (+15 min)
                    </div>
                    <div className="text-[11px] text-[#8A8AA8] mt-0.5">
                      Advances simulated clock deeper into night
                    </div>
                  </div>
                  <span className="text-[#3B82F6] font-bold">&rarr;</span>
                </button>

                {/* 4. Trigger Missed Arrival */}
                <button
                  onClick={() => {
                    triggerMissedArrivalDemo();
                    setDemoDrawerOpen(false);
                  }}
                  className="w-full p-3.5 bg-[#FFF9F5] hover:bg-[#FFEEDB] border border-[#FFE9D6] rounded-2xl text-left transition flex items-center justify-between shadow-sm group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#EA580C] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#EA580C]" /> 4. Trigger missed arrival
                    </div>
                    <div className="text-[11px] text-[#8A8AA8] mt-0.5">
                      Opens 60s "Are you safe?" check & SMS alert
                    </div>
                  </div>
                  <span className="text-[#EA580C] font-bold">&rarr;</span>
                </button>

                {/* 5. Trigger Off-Route Deviation */}
                <button
                  onClick={() => {
                    triggerOffRouteCheckIn();
                    setDemoDrawerOpen(false);
                  }}
                  className="w-full p-3.5 bg-[#FFF9F5] hover:bg-[#FFEEDB] border border-[#FFE9D6] rounded-2xl text-left transition flex items-center justify-between shadow-sm group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#EA580C] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#EA580C]" /> 5. Simulate off-route deviation
                    </div>
                    <div className="text-[11px] text-[#8A8AA8] mt-0.5">
                      Simulates GPS wandering 280m off corridor
                    </div>
                  </div>
                  <span className="text-[#EA580C] font-bold">&rarr;</span>
                </button>

                {/* 6. Trigger Sudden Stop */}
                <button
                  onClick={() => {
                    triggerSuddenStopCheckIn();
                    setDemoDrawerOpen(false);
                  }}
                  className="w-full p-3.5 bg-[#FFF9F5] hover:bg-[#FFEEDB] border border-[#FFE9D6] rounded-2xl text-left transition flex items-center justify-between shadow-sm group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#EA580C] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#EA580C]" /> 6. Simulate sudden stop (&gt;3 min)
                    </div>
                    <div className="text-[11px] text-[#8A8AA8] mt-0.5">
                      Triggers vehicle standstill watchdog check-in
                    </div>
                  </div>
                  <span className="text-[#EA580C] font-bold">&rarr;</span>
                </button>

                {/* 7. Trigger Smart SOS */}
                <button
                  onClick={() => {
                    triggerSOS();
                    setDemoDrawerOpen(false);
                  }}
                  className="w-full p-3.5 bg-[#FFF1F2] hover:bg-[#FFE4E6] border border-[#FF4D4F]/30 rounded-2xl text-left transition flex items-center justify-between shadow-sm group"
                >
                  <div>
                    <div className="text-xs font-bold text-[#FF4D4F] flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-[#FF4D4F]" /> 7. Immediate Smart SOS
                    </div>
                    <div className="text-[11px] text-[#8A8AA8] mt-0.5">
                      Broadcasts live telemetry to contacts & safe havens
                    </div>
                  </div>
                  <span className="text-[#FF4D4F] font-bold">&rarr;</span>
                </button>

              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t border-slate-100 mt-6">
              <button
                onClick={handleReset}
                disabled={loadingAction === 'reset'}
                className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#1B1B3A] flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${loadingAction === 'reset' ? 'animate-spin' : ''}`} />
                <span>Reset demo to initial state</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
