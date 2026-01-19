import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = 'auth_tokens';

interface JWTPayload {
  exp: number;
  userId: string;
  role: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  user: any;
}

export const tokenService = {
  async saveTokens(tokens: Tokens) {
    await SecureStore.setItemAsync(TOKEN_KEY, JSON.stringify(tokens));
  },

  async getTokens(): Promise<Tokens | null> {
    const tokens = await SecureStore.getItemAsync(TOKEN_KEY);
    return tokens ? JSON.parse(tokens) : null;
  },

  async clearTokens() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async setToken(token: string) {
    const tokens = await this.getTokens();
    if (tokens) {
      await this.saveTokens({
        ...tokens,
        accessToken: token,
      });
    }
  },

  async setRefreshToken(token: string) {
    const tokens = await this.getTokens();
    if (tokens) {
      await this.saveTokens({
        ...tokens,
        refreshToken: token,
      });
    }
  },

  async getAccessToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens?.accessToken || null;
  },

  async getRefreshToken(): Promise<string | null> {
    const tokens = await this.getTokens();
    return tokens?.refreshToken || null;
  },

  isTokenExpired(token: string, bufferSeconds: number = 0): boolean {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const bufferTime = bufferSeconds * 1000; // Convert buffer to milliseconds
      
      const isExpired = expirationTime - bufferTime < currentTime;
      
      if (isExpired) {
        console.log('Token expired at:', new Date(expirationTime));
        console.log('Current time:', new Date(currentTime));
      }
      
      return isExpired;
    } catch (error) {
      console.error('Token decode error:', error);
      return true;
    }
  },

  async validateTokens(): Promise<boolean> {
    const tokens = await this.getTokens();
    if (!tokens) {
      console.log('No tokens found');
      return false;
    }

    // Check refresh token first (60 days)
    // Add a 1-hour buffer for refresh token
    if (this.isTokenExpired(tokens.refreshToken, 3600)) {
      console.log('Refresh token expired');
      await this.clearTokens();
      return false;
    }

    // Check access token (5 days)
    // Add a 5-minute buffer for access token
    const isAccessTokenExpired = this.isTokenExpired(tokens.accessToken, 300);
    if (isAccessTokenExpired) {
      console.log('Access token expired, but refresh token still valid');
      // We don't return false here because the refresh token is still valid
      // The API interceptor will handle the token refresh
    }

    return true;
  }
}; 