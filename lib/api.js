import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const apiService = {

  login: async (data) => {
    const response = await api.post('/auth/login', data);
    if (typeof window !== 'undefined' && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (data) => {
    console.log('Registration response:', data);
    const response = await api.post('/auth/register', data);
    if (typeof window !== 'undefined' && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    console.log('Registration response:', response.data);
    return response.data;
  },

  getZones: async () => {
    const response = await api.get('/parking/zones');
    return response.data;
  },

  getSlots: async (zoneId = null) => {
    const url = zoneId ? `/parking/slots?zoneId=${zoneId}` : '/parking/slots';
    const response = await api.get(url);
    return response.data;
  },

  reserveSlot: async (data) => {
    const response = await api.post('/parking/reserve', data);
    return response.data;
  },
  
  getStatistics: async () => {
    const response = await api.get(`/parking/static`);
    return response.data;
  },

  getActiveSession: async (userId) => {
    const response = await api.get(`/parking/sessions/active/${userId}`);
    return response.data;
  },
  
  postSessionActive: async (data) => {
    const response = await api.post('/parking/sessions/start', data);
    return response.data;
  },
};
