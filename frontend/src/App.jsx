import React, { useEffect, useState } from 'react';
import { useApp } from './context/AppContext';
import TopHeader from './components/TopHeader';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import DemoControlsDrawer from './components/DemoControlsDrawer';
import MissedArrivalModal from './components/MissedArrivalModal';
import PrivacyModal from './components/PrivacyModal';
import NotificationToast from './components/NotificationToast';

import PlanJourneyView from './views/PlanJourneyView';
import ActiveJourneyView from './views/ActiveJourneyView';
import ContactsView from './views/ContactsView';
import FeedbackView from './views/FeedbackView';
import AuthorityView from './views/AuthorityView';
import RoadmapView from './views/RoadmapView';
import PublicTrackView from './views/PublicTrackView';
import AICompanionChat from './components/AICompanionChat';
import { AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

export default function App() {
  const { activeTab, setActiveTab, isOfflineDemo, refreshTransitData } = useApp();
  const [trackToken, setTrackToken] = useState(null);
  const [companionOpen, setCompanionOpen] = useState(false);

  // Check URL pathname for direct /track/:token or /authority
  useEffect(() => {
    const path = window.location.pathname;
    const trackMatch = path.match(/\/track\/([a-zA-Z0-9_-]+)/);
    if (trackMatch) {
      setTrackToken(trackMatch[1]);
    } else if (path === '/authority') {
      setActiveTab('authority');
    } else if (path === '/roadmap') {
      setActiveTab('roadmap');
    }
  }, [setActiveTab]);

  const renderActiveView = () => {
    if (trackToken) {
      return <PublicTrackView token={trackToken} onBack={() => setTrackToken(null)} />;
    }

    switch (activeTab) {
      case 'plan':
        return <PlanJourneyView />;
      case 'active':
        return <ActiveJourneyView />;
      case 'contacts':
        return <ContactsView />;
      case 'feedback':
        return <FeedbackView />;
      case 'authority':
        return <AuthorityView />;
      case 'roadmap':
        return <RoadmapView />;
      default:
        return <PlanJourneyView />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F1F0FA] text-[#1B1B3A] overflow-hidden select-none">
      {/* Top Header */}
      <TopHeader />

      {/* Small Offline Demo Data Chip (Never-empty fallback state) */}
      {isOfflineDemo && (
        <div className="bg-[#FAF8FF] dark:bg-[#1E1B2E] border-b border-[#8B5CF6]/15 px-4 py-1.5 text-xs text-[#6B5A8E] dark:text-[#C5BFE0] flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ECEAF8] dark:bg-[#2A2445] text-[#8B5CF6] dark:text-[#A78BFA] text-[10px] font-bold border border-[#8B5CF6]/25">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse"></span>
              Offline demo data
            </span>
            <span className="hidden sm:inline text-[11px] opacity-80">Precomputed transit grid & Scikit-learn AI predictions active</span>
          </div>
          <button
            onClick={refreshTransitData}
            className="px-2.5 py-0.5 bg-white dark:bg-[#25203A] hover:bg-slate-50 border border-[#8B5CF6]/30 rounded-full font-bold text-[10px] text-[#8B5CF6] flex items-center gap-1 shadow-xs transition"
          >
            <RefreshCw className="w-2.5 h-2.5" /> Reconnect
          </button>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Primary View Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden pb-16 md:pb-0 relative">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Floating AI Companion Trigger Button */}
      <button
        onClick={() => setCompanionOpen(true)}
        className="fixed bottom-20 md:bottom-6 left-6 z-40 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full shadow-soft flex items-center gap-2 text-xs font-bold text-[#1B1B3A] transition hover:scale-105 active:scale-95 group"
        title="Open grounded AI Travel Companion"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#FF5FA2] via-[#8B5CF6] to-[#3B82F6] flex items-center justify-center text-white shadow-xs group-hover:rotate-12 transition">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <span>AI Companion</span>
        <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
      </button>

      {/* AI Travel Companion Modal */}
      <AICompanionChat isOpen={companionOpen} onClose={() => setCompanionOpen(false)} />

      {/* Global Safety Modals & Drawers */}
      <DemoControlsDrawer />
      <MissedArrivalModal />
      <PrivacyModal />
      <NotificationToast />
    </div>
  );
}
