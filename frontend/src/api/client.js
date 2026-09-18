const API_BASE = '/api';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('nightshield_token') || 'token_user_demo_778';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
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

    return await response.json();
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  auth: {
    login: (email, password) => apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    getMe: () => apiRequest('/auth/me'),
    setConsent: (consent) => apiRequest('/auth/consent', {
      method: 'POST',
      body: JSON.stringify({ consent }),
    }),
  },

  contacts: {
    getAll: () => apiRequest('/contacts'),
    add: (contact) => apiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    }),
    edit: (id, contact) => apiRequest(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    }),
    delete: (id) => apiRequest(`/contacts/${id}`, {
      method: 'DELETE',
    }),
  },

  transit: {
    getStops: () => apiRequest('/stops'),
    getRoutes: (origin, destination) => {
      let q = '';
      if (origin && destination) {
        q = `?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
      }
      return apiRequest(`/routes${q}`);
    },
    getHelpPoints: (lat, lng) => {
      let q = '';
      if (lat !== undefined && lng !== undefined) {
        q = `?lat=${lat}&lng=${lng}`;
      }
      return apiRequest(`/help-points${q}`);
    },
    getLiveVehicles: () => apiRequest('/live-vehicles'),
  },

  risk: {
    assess: (routeId, originId, destId, hour) => {
      const params = new URLSearchParams();
      if (routeId) params.append('route_id', routeId);
      if (originId) params.append('origin_id', originId);
      if (destId) params.append('dest_id', destId);
      if (hour !== undefined) params.append('hour', hour);
      return apiRequest(`/risk?${params.toString()}`);
    },
    getAlternatives: (routeId, originId, destId) => {
      const params = new URLSearchParams({
        route_id: routeId,
        origin_id: originId,
        dest_id: destId,
      });
      return apiRequest(`/alternatives?${params.toString()}`);
    },
    getDelay: (routeId, stopId, hour) => {
      const params = new URLSearchParams();
      if (routeId) params.append('route_id', routeId);
      if (stopId) params.append('stop_id', stopId);
      if (hour !== undefined) params.append('hour', hour);
      return apiRequest(`/delay?${params.toString()}`);
    },
    rankRoutes: (originId, destId, hour) => {
      const params = new URLSearchParams();
      if (originId) params.append('origin_id', originId);
      if (destId) params.append('dest_id', destId);
      if (hour !== undefined) params.append('hour', hour);
      return apiRequest(`/routes/rank?${params.toString()}`);
    },
    getHotspots: () => apiRequest('/hotspots'),
    getBestTime: (routeId, originId, hour) => {
      const params = new URLSearchParams();
      if (routeId) params.append('route_id', routeId);
      if (originId) params.append('origin_id', originId);
      if (hour !== undefined) params.append('hour', hour);
      return apiRequest(`/departure/best-time?${params.toString()}`);
    },
    companionChat: (message, stopId, routeId) => apiRequest('/companion', {
      method: 'POST',
      body: JSON.stringify({ message, stop_id: stopId, route_id: routeId }),
    }),
  },

  journey: {
    start: (data) => apiRequest('/journey/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    getActive: () => apiRequest('/journey/active'),
    update: (data) => apiRequest('/journey/update', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    complete: (journeyId) => apiRequest('/journey/complete', {
      method: 'POST',
      body: JSON.stringify({ journey_id: journeyId }),
    }),
    missedArrival: (data) => apiRequest('/journey/missed-arrival', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  sos: {
    trigger: (data) => apiRequest('/sos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  feedback: {
    getAll: () => apiRequest('/feedback'),
    submit: (data) => apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  },

  authority: {
    getAnalytics: () => apiRequest('/authority/analytics'),
  },

  demo: {
    delay: (routeId, delayMinutes) => apiRequest('/demo/delay', {
      method: 'POST',
      body: JSON.stringify({ route_id: routeId, delay_minutes: delayMinutes }),
    }),
    disrupt: (routeId) => apiRequest('/demo/disrupt', {
      method: 'POST',
      body: JSON.stringify({ route_id: routeId }),
    }),
    fastForward: (minutes) => apiRequest('/demo/fast-forward', {
      method: 'POST',
      body: JSON.stringify({ minutes }),
    }),
    reset: () => apiRequest('/demo/reset', {
      method: 'POST',
    }),
  },

  share: {
    get: (token) => apiRequest(`/share/${token}`),
  }
};
