export enum UserRole {
  CLIENT = 'CLIENT',
  DRIVER = 'DRIVER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (auth: AuthResponse['data']) => Promise<void>;
  signOut: () => Promise<void>;
  initAuth: () => Promise<void>;
} 