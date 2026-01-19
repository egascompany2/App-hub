export enum UserRole {
  CLIENT = 'CLIENT',
  DRIVER = 'DRIVER'
}

export interface User {
  id: string;
  phoneNumber: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  address: string | null;
  tankSize: string | null;
  onboarded: boolean;
  latitude: number;
  longitude: number;
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
  isInitialized: boolean;
  setAuth: (auth: AuthResponse) => void;
  signOut: () => Promise<void>;
  initAuth: () => Promise<void>;
}
