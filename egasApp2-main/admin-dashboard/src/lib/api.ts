import axios from 'axios';
import { authService } from '../services/auth';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');

  // 🔐 Skip Ngrok browser warning
  config.headers['ngrok-skip-browser-warning'] = 'true';

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
