import React from 'react';
import { 
  Sparkles, 
  Cpu, 
  Bot, 
  Watch, 
  Network, 
  ShieldAlert, 
  Radio, 
  ArrowRight,
  Zap
} from 'lucide-react';

export default function RoadmapView() {
  const roadmapCards = [
    {
      id: 1,
      title: "Predictive safety intelligence",
      icon: Cpu,
      color: "gradient-violet-blue",
      badge: "Edge ML",
      desc: "Deep neural models running on-device to predict unlit corridors, crowd dispersal patterns, and micro-delays before departure.",
    },
    {
      id: 2,
      title: "AI travel companion",
      icon: Bot,
      color: "gradient-pink-violet",
      badge: "LLM Audio",
      desc: "An ambient, conversational safety voice agent that keeps passengers connected, conducts silent stress check-ins, and navigates safe walkways.",
    },
    {
      id: 3,
      title: "Autonomous missed-arrival stoppage",
      icon: ShieldAlert,
      color: "bg-gradient-to-tr from-[#EA580C] to-[#F59E0B]",
      badge: "Dead-Reckoning",
      desc: "Continuous inertial motion sensing to detect vehicle breakdowns, route deviations, and sudden off-grid drops with auto-dispatch escalations.",
    },
    {
      id: 4,
      title: "Wearable & smart IoT integration",
      icon: Watch,
      color: "bg-gradient-to-tr from-[#10B981] to-[#06B6D4]",
      badge: "BLE & Biometrics",
      desc: "Smartwatch silent gestures, heart-rate panic spikes detection, and BLE beacon handshakes at transit stops for passive guardian check-ins.",
    },
    {
      id: 5,
      title: "City-wide mobility interconnect",
      icon: Network,
      color: "gradient-violet-blue",
      badge: "GTFS-RT / V2X",
      desc: "Harmonized multimodal routing synchronizing last-mile electric bikes, on-demand night micro-shuttles, and regional rail under unified safety tiers.",
    },
    {
      id: 6,
      title: "Advanced autonomous city grid",
      icon: Radio,
      color: "gradient-pink-violet",
      badge: "Smart City",
      desc: "Direct integration with municipal dynamic street lighting to brighten transit walkways automatically when lone night commuters are detected.",
    },
  ];

  return (
    <div className="flex-1 p-4 md:p-8 bg-[#F1F0FA] overflow-y-auto max-w-6xl mx-auto w-full space-y-8 pb-12">
      
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-slate-200 rounded-full text-[#8B5CF6] text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Futuristic scope & horizons</span>
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-[#1B1B3A] tracking-tight">
          The future of nocturnal urban mobility
        </h2>
        <p className="text-xs md:text-sm text-[#8A8AA8] leading-relaxed">
          Pioneering the transition from passive transit information to proactive, ambient cyber-physical protection.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roadmapCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="saas-card p-6 flex flex-col justify-between space-y-4 hover:shadow-soft-hover transition"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${card.color} p-0.5 shadow-md flex items-center justify-center`}>
                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-[#8B5CF6]">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F8F7FD] text-[10px] font-bold text-[#8A8AA8]">
                      {card.badge}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#ECEAF8] text-[#8B5CF6] text-[10px] font-bold">
                      Coming soon
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-[#1B1B3A]">
                    {card.title}
                  </h3>
                  <p className="text-xs text-[#8A8AA8] mt-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#8B5CF6]">
                <span>Architecture Phase 2.0</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Closing Banner */}
      <div className="p-8 rounded-card-lg bg-white border border-slate-100 shadow-soft text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-[#ECEAF8] flex items-center justify-center mx-auto text-[#8B5CF6]">
          <Zap className="w-6 h-6" />
        </div>

        <h3 className="text-lg md:text-xl font-extrabold text-[#1B1B3A] tracking-tight">
          "From a transport information app &rarr; to an intelligent, connected urban safety companion."
        </h3>

        <p className="text-xs text-[#8A8AA8] max-w-xl mx-auto leading-relaxed">
          NightShield transforms late-night vulnerability into a synchronized network of AI vigilance, rapid emergency response, and verified community care.
        </p>
      </div>

    </div>
  );
}
