/**
 * Axios API Client for Tamil Panchang API
 *
 * Provides typed HTTP client with:
 * - Request/response interceptors
 * - Error handling
 * - Automatic token refresh (future)
 * - Base URL configuration
 */

import type { APIErrorResponse } from '@/types/api';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Create configured Axios instance
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Log request in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, config.params);
      }

      return config;
    },
    (error) => {
      console.error('[API] Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[API] Response ${response.status}:`, response.data);
      }

      return response;
    },
    (error: AxiosError<APIErrorResponse>) => {
      // Handle errors
      if (error.response) {
        // Server responded with error status
        const { status, data } = error.response;

        console.error(`[API] Error ${status}:`, data?.error?.message || error.message);

        // You can add custom error handling here
        if (status === 401) {
          // Unauthorized - redirect to login (future)
          console.warn('[API] Unauthorized request');
        } else if (status === 404) {
          console.warn('[API] Resource not found');
        } else if (status >= 500) {
          console.error('[API] Server error');
        }
      } else if (error.request) {
        // Request made but no response received
        console.error('[API] No response:', error.message);
      } else {
        // Error in request configuration
        console.error('[API] Request setup error:', error.message);
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Export singleton instance
export const apiClient = createApiClient();

/**
 * Type-safe API client wrapper
 */
export const api = {
  /**
   * GET request
   */
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.get<T>(url, config).then((res) => res.data);
  },

  /**
   * POST request
   */
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.post<T>(url, data, config).then((res) => res.data);
  },

  /**
   * PUT request
   */
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.put<T>(url, data, config).then((res) => res.data);
  },

  /**
   * PATCH request
   */
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.patch<T>(url, data, config).then((res) => res.data);
  },

  /**
   * DELETE request
   */
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return apiClient.delete<T>(url, config).then((res) => res.data);
  },
};

export default api;
