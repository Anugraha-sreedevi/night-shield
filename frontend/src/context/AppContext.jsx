import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import fallbackData from '../data/fallbackData.json';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'user_demo_778',
    email: 'user@nightshield.app',
    full_name: 'Elena Rostova',
    consent_location: true,
  });
  
  const [activeTab, setActiveTab] = useState('plan'); // 'plan', 'active', 'contacts', 'feedback', 'authority', 'roadmap'
  const [stops, setStops] = useState(() => fallbackData.stops || []);
  const [routes, setRoutes] = useState(() => fallbackData.routes || []);
  const [helpPoints, setHelpPoints] = useState(() => fallbackData.helpPoints || []);
  const [liveVehicles, setLiveVehicles] = useState(() => fallbackData.liveVehicles || []);
  const [contacts, setContacts] = useState(() => fallbackData.contacts || []);
  const [activeJourney, setActiveJourney] = useState(null);
  const [simulatedClock, setSimulatedClock] = useState('23:45:00');
  const [isOfflineDemo, setIsOfflineDemo] = useState(false);
  
  // Dark / Light Theme Mode
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nightshield_theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nightshield_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };
  
  // Emergency & Alerts
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);
  const [missedArrivalState, setMissedArrivalState] = useState({
    visible: false,
    countdown: 60,
    escalated: false,
    dispatchedAlerts: []
  });
  
  // Toast notifications (Simulated SMS / Alerts)
  const [notifications, setNotifications] = useState([]);
  const [demoDrawerOpen, setDemoDrawerOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const addNotification = (title, message, type = 'info', meta = null) => {
    const id = Date.now() + Math.random();
    setNotifications((prev) => [
      { id, title, message, type, meta, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9)
    ]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Fetch initial data
  const refreshTransitData = useCallback(async () => {
    try {
      const [stopsRes, routesRes, helpRes, contactsRes] = await Promise.all([
        api.transit.getStops(),
        api.transit.getRoutes(),
        api.transit.getHelpPoints(),
        api.contacts.getAll(),
      ]);

      if (stopsRes && stopsRes.stops && stopsRes.stops.length > 0) {
        setStops(stopsRes.stops);
      }
      if (routesRes && routesRes.length > 0) {
        setRoutes(routesRes);
      }
      if (helpRes && helpRes.length > 0) {
        setHelpPoints(helpRes);
      }
      if (contactsRes && contactsRes.length > 0) {
        setContacts(contactsRes);
      }
      setIsOfflineDemo(false);
      setBackendError(null);
    } catch (err) {
      console.warn('Backend API call notice, activating offline demo data grid:', err);
      setStops(fallbackData.stops || []);
      setRoutes(fallbackData.routes || []);
      setHelpPoints(fallbackData.helpPoints || []);
      setContacts(fallbackData.contacts || []);
      setLiveVehicles(fallbackData.liveVehicles || []);
      setIsOfflineDemo(true);
      setBackendError(null);
    }
  }, []);

  // Poll live vehicles & active journey
  const pollLiveStatus = useCallback(async () => {
    try {
      const [vehRes, journeyRes] = await Promise.all([
        api.transit.getLiveVehicles(),
        api.journey.getActive(),
      ]);

      if (vehRes) {
        setLiveVehicles(vehRes.vehicles || []);
        if (vehRes.simulated_clock) {
          setSimulatedClock(vehRes.simulated_clock);
        }
      }

      if (journeyRes && journeyRes.active_journey) {
        setActiveJourney(journeyRes.active_journey);
      }
    } catch (err) {
      // Background poll silently retry
    }
  }, []);

  useEffect(() => {
    refreshTransitData();
    const interval = setInterval(pollLiveStatus, 3000);
    return () => clearInterval(interval);
  }, [refreshTransitData, pollLiveStatus]);

  // Check-in prompt state (Off-route & Sudden-stop detection)
  const [checkInPrompt, setCheckInPrompt] = useState(null);

  // Offline caching: save/restore from localStorage
  useEffect(() => {
    try {
      const cachedContacts = localStorage.getItem('nightshield_cached_contacts');
      if (cachedContacts && contacts.length === 0) {
        setContacts(JSON.parse(cachedContacts));
      }
      const cachedJourney = localStorage.getItem('nightshield_cached_journey');
      if (cachedJourney && !activeJourney) {
        setActiveJourney(JSON.parse(cachedJourney));
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem('nightshield_cached_contacts', JSON.stringify(contacts));
    }
  }, [contacts]);

  useEffect(() => {
    if (activeJourney) {
      localStorage.setItem('nightshield_cached_journey', JSON.stringify(activeJourney));
    }
  }, [activeJourney]);

  // Handle SOS trigger enriched with telemetry (Smart SOS)
  const triggerSOS = async (currentLocation = null) => {
    try {
      const lat = currentLocation?.lat || (activeJourney?.current_lat ?? 12.9720);
      const lng = currentLocation?.lng || (activeJourney?.current_lng ?? 77.6010);
      
      const res = await api.sos.trigger({
        lat,
        lng,
        journey_id: activeJourney?.id,
        route_name: activeJourney?.route?.name || 'Transit Corridor',
        eta_minutes: activeJourney?.eta_minutes || 20,
        risk_score: activeJourney?.risk_score || 35,
        location_name: activeJourney ? `${activeJourney.origin_stop?.name} -> ${activeJourney.dest_stop?.name}` : 'Central Transit Grid',
      });

      setEmergencyActive(true);
      setEmergencyData(res);
      addNotification(
        '🚨 EMERGENCY SMART SOS ACTIVATED',
        `Broadcast with live GPS, Route, ETA & Risk telemetry sent to ${contacts.length} contacts.`,
        'emergency'
      );
      return res;
    } catch (err) {
      console.error('SOS Trigger failed:', err);
      addNotification('SOS Error', 'Could not transmit SOS. Call emergency 112 directly.', 'error');
    }
  };

  const cancelEmergency = () => {
    setEmergencyActive(false);
    setEmergencyData(null);
    addNotification('Safety Status', 'Emergency alert disarmed by user.', 'info');
  };

  // Triggers for off-route and sudden stop check-ins
  const triggerOffRouteCheckIn = () => {
    setCheckInPrompt({
      type: 'off_route',
      title: 'Off-Route Deviation Detected',
      message: 'Your live location has drifted 280m off the scheduled transit path. Are you okay?'
    });
    addNotification(
      '⚠️ Off-Route Alert',
      'Location diverged from transit corridor. Watchdog check-in prompt active.',
      'warning'
    );
  };

  const triggerSuddenStopCheckIn = () => {
    setCheckInPrompt({
      type: 'sudden_stop',
      title: 'Unexpected Stoppage Detected',
      message: 'Vehicle telemetry indicates zero movement for 4 minutes outside designated stops. Everything alright?'
    });
    addNotification(
      '⚠️ Stoppage Alert',
      'Vehicle stalled outside platform. Watchdog check-in prompt active.',
      'warning'
    );
  };

  // Handle Missed Arrival Escalation
  const triggerMissedArrivalDemo = async () => {
    // Stage 1: "Are you safe?" Prompt
    setMissedArrivalState({
      visible: true,
      countdown: 60,
      escalated: false,
      dispatchedAlerts: []
    });
    addNotification(
      '⚠️ Missed Arrival Verification',
      'Expected arrival time passed. Please confirm your safety within 60s.',
      'warning'
    );
  };

  const confirmSafety = async () => {
    setMissedArrivalState((prev) => ({ ...prev, visible: false, escalated: false }));
    addNotification('Status Verified', 'Thank you! Your trip status has been updated to safe.', 'success');
  };

  const escalateMissedArrival = async () => {
    try {
      const lat = activeJourney?.current_lat || 12.9650;
      const lng = activeJourney?.current_lng || 77.5950;
      
      const res = await api.journey.missedArrival({
        journey_id: activeJourney?.id,
        stage: 'alert_contacts',
        lat,
        lng
      });

      setMissedArrivalState((prev) => ({
        ...prev,
        escalated: true,
        dispatchedAlerts: res.dispatched_notifications || []
      }));

      addNotification(
        '🚨 AUTOMATED ESCALATION FIRED',
        `No response received. SMS alerts with live GPS dispatched to ${contacts.length} contacts.`,
        'emergency'
      );
    } catch (err) {
      console.error('Escalation error:', err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        activeTab,
        setActiveTab,
        stops,
        routes,
        helpPoints,
        liveVehicles,
        contacts,
        setContacts,
        activeJourney,
        setActiveJourney,
        simulatedClock,
        emergencyActive,
        emergencyData,
        triggerSOS,
        cancelEmergency,
        missedArrivalState,
        setMissedArrivalState,
        triggerMissedArrivalDemo,
        confirmSafety,
        escalateMissedArrival,
        checkInPrompt,
        setCheckInPrompt,
        triggerOffRouteCheckIn,
        triggerSuddenStopCheckIn,
        notifications,
        addNotification,
        removeNotification,
        demoDrawerOpen,
        setDemoDrawerOpen,
        privacyModalOpen,
        setPrivacyModalOpen,
        backendError,
        isOfflineDemo,
        refreshTransitData,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
