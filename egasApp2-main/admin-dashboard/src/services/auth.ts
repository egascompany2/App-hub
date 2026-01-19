import { api } from '../lib/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post<AuthResponse>('/admin/auth/login', credentials);    
    return response.data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};