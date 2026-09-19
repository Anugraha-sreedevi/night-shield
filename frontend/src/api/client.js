import fallbackData from '../data/fallbackData.json';

const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/$/, '');

let isOfflineMode = false;

export function getIsOfflineMode() {
  return isOfflineMode;
}

export function setIsOfflineMode(val) {
  isOfflineMode = val;
}

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('nightshield_token') || 'token_user_demo_778';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errDetail = 'Network response was not ok';
      try {
        const errJson = await response.json();
        errDetail = errJson.error || errJson.message || errDetail;
      } catch (e) {
        // Fallback
      }
      throw new Error(errDetail);
    }

    isOfflineMode = false;
    return await response.json();
  } catch (error) {
    isOfflineMode = true;
    console.warn(`API request to [${options.method || 'GET'} ${endpoint}] failed:`, error.message);
    throw error;
  }
}

export const api = {
  auth: {
    login: async (email, password) => {
      try {
        return await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
      } catch (e) {
        return {
          token: 'token_user_demo_778',
          user: {
            id: 'user_demo_778',
            email: email || 'user@nightshield.app',
            full_name: 'Elena Rostova',
            consent_location: true,
            consent_timestamp: new Date().toISOString(),
          },
        };
      }
    },
    getMe: async () => {
      try {
        return await apiRequest('/auth/me');
      } catch (e) {
        return {
          id: 'user_demo_778',
          email: 'user@nightshield.app',
          full_name: 'Elena Rostova',
          consent_location: true,
          consent_timestamp: new Date().toISOString(),
        };
      }
    },
    setConsent: async (consent) => {
      try {
        return await apiRequest('/auth/consent', {
          method: 'POST',
          body: JSON.stringify({ consent }),
        });
      } catch (e) {
        return { success: true, consent };
      }
    },
  },

  contacts: {
    getAll: async () => {
      try {
        return await apiRequest('/contacts');
      } catch (e) {
        return fallbackData.contacts || [];
      }
    },
    add: async (contact) => {
      try {
        return await apiRequest('/contacts', {
          method: 'POST',
          body: JSON.stringify(contact),
        });
      } catch (e) {
        return { ...contact, id: `tc_${Date.now()}` };
      }
    },
    edit: async (id, contact) => {
      try {
        return await apiRequest(`/contacts/${id}`, {
          method: 'PUT',
          body: JSON.stringify(contact),
        });
      } catch (e) {
        return { success: true, id };
      }
    },
    delete: async (id) => {
      try {
        return await apiRequest(`/contacts/${id}`, {
          method: 'DELETE',
        });
      } catch (e) {
        return { success: true };
      }
    },
  },

  transit: {
    getStops: async () => {
      try {
        return await apiRequest('/stops');
      } catch (e) {
        return {
          city_name: 'Neo-Veridia Central Metro',
          stops: fallbackData.stops || [],
        };
      }
    },
    getRoutes: async (origin, destination) => {
      let q = '';
      if (origin && destination) {
        q = `?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
      }
      try {
        return await apiRequest(`/routes${q}`);
      } catch (e) {
        if (origin && destination) {
          const matching = fallbackData.routes.filter(
            (r) => r.stops.includes(origin) && r.stops.includes(destination)
          );
          if (matching.length > 0) {
            return matching.map((r) => ({
              route: r,
              is_direct: true,
              total_eta_min: r.base_duration_min,
            }));
          }
        }
        return fallbackData.routes || [];
      }
    },
    getHelpPoints: async (lat, lng) => {
      let q = '';
      if (lat !== undefined && lng !== undefined) {
        q = `?lat=${lat}&lng=${lng}`;
      }
      try {
        return await apiRequest(`/help-points${q}`);
      } catch (e) {
        return fallbackData.helpPoints || [];
      }
    },
    getLiveVehicles: async () => {
      try {
        return await apiRequest('/live-vehicles');
      } catch (e) {
        return {
          simulated_clock: '23:45:00',
          vehicles: fallbackData.liveVehicles || [],
        };
      }
    },
  },

  risk: {
    assess: async (routeId, originId, destId, hour) => {
      const params = new URLSearchParams();
      if (routeId) params.append('route_id', routeId);
      if (originId) params.append('origin_id', originId);
      if (destId) params.append('dest_id', destId);
      if (hour !== undefined) params.append('hour', hour);
      try {
        return await apiRequest(`/risk?${params.toString()}`);
      } catch (e) {
        const pre = fallbackData.precomputedRisk?.[routeId] || fallbackData.precomputedRisk?.['route_n1'];
        return pre || {
          route_id: routeId,
          route_name: 'Central Corridor Line',
          risk_score: 28,
          risk_tier: 'Low',
          tier_color: '#16A34A',
          top_factors: ['Monitored transit corridor with active CCTV marshals and rapid headway.'],
          predicted_delay: {
            predicted_delay_minutes: 0,
            confidence_pct: 94,
            message: 'Next vehicle likely on schedule',
            is_delayed: false,
          },
          metrics: {
            delay_minutes: 0,
            crowd_level: 'Medium',
            lighting: 'High',
            cctv_active: true,
            sos_booth: true,
            frequency_min: 15,
          },
        };
      }
    },
    getAlternatives: async (routeId, originId, destId) => {
      const params = new URLSearchParams({
        route_id: routeId,
        origin_id: originId,
        dest_id: destId,
      });
      try {
        return await apiRequest(`/alternatives?${params.toString()}`);
      } catch (e) {
        return fallbackData.alternatives || [];
      }
    },
    getDelay: async (routeId, stopId, hour) => {
      const params = new URLSearchParams();
      if (routeId) params.append('route_id', routeId);
      if (stopId) params.append('stop_id', stopId);
      if (hour !== undefined) params.append('hour', hour);
      try {
        return await apiRequest(`/delay?${params.toString()}`);
      } catch (e) {
        const pre = fallbackData.precomputedRisk?.[routeId]?.predicted_delay;
        return pre || {
          predicted_delay_minutes: 0,
          confidence_pct: 94,
          message: 'Next vehicle likely on schedule',
          is_delayed: false,
        };
      }
    },
    rankRoutes: async (originId, destId, hour) => {
      const params = new URLSearchParams();
      if (originId) params.append('origin_id', originId);
      if (destId) params.append('dest_id', destId);
      if (hour !== undefined) params.append('hour', hour);
      try {
        return await apiRequest(`/routes/rank?${params.toString()}`);
      } catch (e) {
        return fallbackData.rankedRoutes || [];
      }
    },
    getHotspots: async () => {
      try {
        return await apiRequest('/hotspots');
      } catch (e) {
        return fallbackData.hotspots || [];
      }
    },
    getBestTime: async (routeId, originId, hour) => {
      const params = new URLSearchParams();
      if (routeId) params.append('route_id', routeId);
      if (originId) params.append('origin_id', originId);
      if (hour !== undefined) params.append('hour', hour);
      try {
        return await apiRequest(`/departure/best-time?${params.toString()}`);
      } catch (e) {
        return fallbackData.bestTime || {
          recommended_slot: 'Leave now',
          time_saved_min: 0,
          risk_reduction_pts: 0,
          summary: 'Platform wait is minimal with current scheduled departures.',
        };
      }
    },
    companionChat: async (message, stopId, routeId) => {
      try {
        return await apiRequest('/companion', {
          method: 'POST',
          body: JSON.stringify({ message, stop_id: stopId, route_id: routeId }),
        });
      } catch (e) {
        return {
          response: "I'm monitoring your commute in offline demo mode. Corridor safety parameters are stable. Stations feature active CCTV marshals and SOS call boxes.",
        };
      }
    },
  },

  journey: {
    start: async (data) => {
      try {
        return await apiRequest('/journey/start', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (e) {
        const origStop = fallbackData.stops.find((s) => s.id === data.origin_id) || fallbackData.stops[0];
        const destStop = fallbackData.stops.find((s) => s.id === data.dest_id) || fallbackData.stops[fallbackData.stops.length - 1];
        return {
          journey_id: `journey_demo_${Date.now()}`,
          origin_stop: origStop,
          dest_stop: destStop,
          eta_minutes: data.eta_minutes || 24,
          eta_timestamp: new Date(Date.now() + 24 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          share_token: `share_${Date.now()}`,
        };
      }
    },
    getActive: async () => {
      try {
        return await apiRequest('/journey/active');
      } catch (e) {
        return { active_journey: null };
      }
    },
    update: async (data) => {
      try {
        return await apiRequest('/journey/update', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (e) {
        return { success: true };
      }
    },
    complete: async (journeyId) => {
      try {
        return await apiRequest('/journey/complete', {
          method: 'POST',
          body: JSON.stringify({ journey_id: journeyId }),
        });
      } catch (e) {
        return { success: true };
      }
    },
    missedArrival: async (data) => {
      try {
        return await apiRequest('/journey/missed-arrival', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (e) {
        return {
          dispatched_notifications: [
            { contact: 'Maya Lin', status: 'delivered (simulated)' },
            { contact: 'David Miller', status: 'delivered (simulated)' },
          ],
        };
      }
    },
  },

  sos: {
    trigger: async (data) => {
      try {
        return await apiRequest('/sos', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (e) {
        return {
          success: true,
          event_id: `sos_demo_${Date.now()}`,
          dispatched_contacts_count: fallbackData.contacts?.length || 3,
          contacts: fallbackData.contacts || [],
          timestamp: new Date().toISOString(),
        };
      }
    },
  },

  feedback: {
    getAll: async () => {
      try {
        return await apiRequest('/feedback');
      } catch (e) {
        return [];
      }
    },
    submit: async (data) => {
      try {
        return await apiRequest('/feedback', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      } catch (e) {
        return { success: true, id: `fb_${Date.now()}` };
      }
    },
  },

  authority: {
    getAnalytics: async () => {
      try {
        return await apiRequest('/authority/analytics');
      } catch (e) {
        return {
          total_active_routes: fallbackData.routes.length,
          total_network_stops: fallbackData.stops.length,
          network_average_risk: 32,
          open_safety_concerns: 2,
          high_risk_corridors: 1,
        };
      }
    },
  },

  demo: {
    delay: (routeId, delayMinutes) =>
      apiRequest('/demo/delay', {
        method: 'POST',
        body: JSON.stringify({ route_id: routeId, delay_minutes: delayMinutes }),
      }).catch(() => ({ success: true })),
    disrupt: (routeId) =>
      apiRequest('/demo/disrupt', {
        method: 'POST',
        body: JSON.stringify({ route_id: routeId }),
      }).catch(() => ({ success: true })),
    fastForward: (minutes) =>
      apiRequest('/demo/fast-forward', {
        method: 'POST',
        body: JSON.stringify({ minutes }),
      }).catch(() => ({ success: true })),
    reset: () =>
      apiRequest('/demo/reset', {
        method: 'POST',
      }).catch(() => ({ success: true })),
  },

  share: {
    get: async (token) => {
      try {
        return await apiRequest(`/share/${token}`);
      } catch (e) {
        return {
          journey: {
            id: 'demo_journey',
            user_id: 'user_demo_778',
            origin_stop_id: 'stop_01',
            destination_stop_id: 'stop_09',
            route_id: 'route_n1',
            status: 'active',
            origin_stop: fallbackData.stops[0],
            dest_stop: fallbackData.stops[8] || fallbackData.stops[1],
            route: fallbackData.routes[0],
            current_lat: 12.972,
            current_lng: 77.601,
            progress_pct: 45,
            eta_minutes: 14,
            risk_score: 28,
          },
        };
      }
    },
  },
};
