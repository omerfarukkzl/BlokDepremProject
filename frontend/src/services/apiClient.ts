import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';
import { useAuthStore } from '../stores';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.axios.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
        console.log(`[API Response Data]`, response.data);

        // Check if response indicates failure even with 200 status
        if (response.data && response.data.success === false) {
          const errorMessage = response.data.error || response.data.message || 'Request failed';
          console.error(`[API Success False] ${errorMessage}`);
          throw new Error(errorMessage);
        }

        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        console.error('[API Response Error]', error);

        // Handle 401 Unauthorized - token refresh
        // Skip token refresh for auth endpoints (login, register don't have tokens yet)
        const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/register');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.axios(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        // Handle network errors
        if (!error.response) {
          throw new Error('Network error. Please check your internet connection.');
        }

        // Handle specific status codes
        switch (error.response.status) {
          case 403:
            throw new Error('Access forbidden. You do not have permission to perform this action.');
          case 404:
            throw new Error('Resource not found.');
          case 422:
            // Validation error
            const validationError = error.response.data?.message || 'Validation error';
            throw new Error(validationError);
          case 500:
            throw new Error('Server error. Please try again later.');
          default:
            const errorMessage = error.response.data?.message || error.response.data?.error || 'An error occurred';
            throw new Error(errorMessage);
        }
      }
    );
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)}`,
        },
      });

      const { token } = response.data.data;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }

  private handleAuthError(): void {
    const { logout } = useAuthStore.getState();
    logout();
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axios.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axios.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axios.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axios.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axios.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // File upload
  async upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axios.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data;
  }

  // Raw axios access for custom requests
  getAxiosInstance(): AxiosInstance {
    return this.axios;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;