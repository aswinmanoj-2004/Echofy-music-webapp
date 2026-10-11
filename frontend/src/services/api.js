import axios from 'axios';

// Dynamically target standard PHP REST API URL or relative fallback
const API_BASE_URL = window.location.origin.includes('localhost:5173')
  ? 'http://localhost/Echofy/backend/api'
  : '/backend/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Authorization Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('echofy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to catch 401 unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid credentials if expired
      localStorage.removeItem('echofy_token');
      localStorage.removeItem('echofy_user');
    }
    return Promise.reject(error);
  }
);

export default api;
