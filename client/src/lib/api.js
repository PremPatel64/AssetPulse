import axios from 'axios';
import { useAuth } from '../store/useAuth';

import { MOCK_ASSETS, MOCK_STATS, MOCK_NOTIFICATIONS, MOCK_ACTIVITY } from './mockData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000')
});

api.interceptors.request.use(config => {
  const token = useAuth.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Force mock mode: intercept all requests and return predefined data
api.defaults.adapter = async (config) => {
  const url = config.url || '';
  let data = {};

  if (url.includes('/api/auth/login')) {
    data = { token: 'mock-jwt-token', user: { name: 'Admin User', role: 'ADMIN' } };
  } else if (url.includes('/api/assets')) {
    if (url.includes('?')) {
      data = { items: MOCK_ASSETS, total: MOCK_ASSETS.length };
    } else {
      // Find specific asset or return array
      const idMatch = url.match(/\/api\/assets\/([a-zA-Z0-9_-]+)/);
      if (idMatch && idMatch[1] !== 'undefined') {
         data = MOCK_ASSETS.find(a => a._id === idMatch[1]) || MOCK_ASSETS[0];
      } else {
         data = MOCK_ASSETS;
      }
    }
  } else if (url.includes('/api/dashboard/stats') || url.includes('/api/portfolio/stats')) {
    data = MOCK_STATS;
  } else if (url.includes('/api/notifications')) {
    data = MOCK_NOTIFICATIONS;
  } else if (url.includes('/api/activity') || url.includes('/api/users/activity')) {
    data = MOCK_ACTIVITY;
  } else if (url.includes('/api/ledger/verify')) {
    data = { ok: true, chains: 10, checked: 45, brokenLinks: [] };
  } else {
    data = { success: true };
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: {}
  };
};

export default api;
