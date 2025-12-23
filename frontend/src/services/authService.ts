import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants';

export interface LoginRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface RegisterRequest {
  walletAddress: string;
  signature: string;
  message: string;
  name: string;
  email?: string;
  locationId: string;
}

export interface AuthResponse {
  user: {
    id: string;
    walletAddress: string;
    name: string;
    email?: string;
    role: 'admin' | 'official' | 'donor';
    locationId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

class AuthService {
  /**
   * Authenticate user with wallet signature
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    // Convert camelCase to snake_case for backend
    const backendData = {
      wallet_address: data.walletAddress,
      signature: data.signature,
      message: data.message,
    };

    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, backendData);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Login failed');
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Convert camelCase to snake_case for backend
    const backendData = {
      wallet_address: data.walletAddress,
      signature: data.signature,
      message: data.message,
      name: data.name,
      email: data.email,
      location_id: parseInt(data.locationId, 10),  // Backend expects number
    };

    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, backendData);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Registration failed');
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH);

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || 'Token refresh failed');
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Even if logout API fails, we should clear local storage
      console.warn('Logout API failed:', error);
    }
  }

  /**
   * Verify if wallet address is registered
   */
  async verifyWallet(walletAddress: string): Promise<{ isRegistered: boolean }> {
    try {
      const response = await apiClient.get<{ isRegistered: boolean }>(
        `${API_ENDPOINTS.AUTH.VERIFY}/${walletAddress}`
      );

      if (response.success && response.data) {
        return response.data;
      }

      return { isRegistered: false };
    } catch (error) {
      return { isRegistered: false };
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;