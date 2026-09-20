import React from 'react';
import { Compass, Navigation, Users, MessageSquareWarning, BarChart3, Sparkles, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { activeTab, setActiveTab, activeJourney, triggerSOS } = useApp();

  const tabs = [
    { id: 'plan', label: 'Plan', icon: Compass },
    { id: 'active', label: 'Live', icon: Navigation, hasDot: !!activeJourney },
    { id: 'contacts', label: 'Guardians', icon: Users },
    { id: 'feedback', label: 'Feedback', icon: MessageSquareWarning },
    { id: 'authority', label: 'Reports', icon: BarChart3 },
    { id: 'roadmap', label: 'Roadmap', icon: Sparkles },
  ];

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-[#151528]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-white/10 px-1.5 flex items-center justify-around z-30 shadow-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-[10px] font-semibold transition cursor-pointer ${
                isActive ? 'text-[#8B5CF6] dark:text-[#A78BFA] font-bold' : 'text-[#8A8AA8] dark:text-[#8A8AA8] hover:text-[#1B1B3A] dark:hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.hasDot && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF5FA2] animate-ping"></span>
                )}
              </div>
              <span className="mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
