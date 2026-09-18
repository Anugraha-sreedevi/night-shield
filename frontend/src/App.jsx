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
  const { activeTab, setActiveTab, backendError, refreshTransitData } = useApp();
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

  // If visiting public guardian tracking link directly
  if (trackToken) {
    return <PublicTrackView token={trackToken} />;
  }

  const renderActiveView = () => {
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

      {/* Backend Notice Banner if unreachable */}
      {backendError && (
        <div className="bg-[#FFE9D6] border-b border-[#EA580C]/20 px-4 py-2 text-xs text-[#EA580C] font-semibold flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#EA580C]" />
            <span>{backendError}</span>
          </div>
          <button
            onClick={refreshTransitData}
            className="px-3 py-1 bg-white hover:bg-slate-50 border border-[#EA580C]/30 rounded-full font-bold text-[11px] text-[#EA580C] flex items-center gap-1 shadow-sm"
          >
            <RefreshCw className="w-3 h-3" /> Retry
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
