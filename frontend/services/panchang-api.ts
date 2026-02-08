/**
 * Panchang API Service
 * Provides typed functions for interacting with Panchang endpoints
 */

import type {
    DailyPanchang,
    PanchangRangeResponse,
    PanchangResponse
} from '@/types/panchang';
import { apiClient } from './api-client';

export interface FetchDailyPanchangParams {
  date: string; // YYYY-MM-DD
  latitude: number;
  longitude: number;
  timezone: string;
  location_id?: string;
}

export interface FetchPanchangRangeParams {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  latitude: number;
  longitude: number;
  timezone: string;
  location_id?: string;
}

/**
 * Fetch daily Panchang for a specific date and location
 *
 * @param params - Date, coordinates, and timezone
 * @returns Promise<DailyPanchang> - Complete daily Panchang data
 *
 * @example
 * const panchang = await fetchDailyPanchang({
 *   date: '2026-02-06',
 *   latitude: 13.0827,
 *   longitude: 80.2707,
 *   timezone: 'Asia/Kolkata'
 * });
 */
export const fetchDailyPanchang = async (
  params: FetchDailyPanchangParams
): Promise<DailyPanchang> => {
  const response = await apiClient.get<PanchangResponse>('/api/v1/panchang', {
    params: {
      date: params.date,
      latitude: params.latitude,
      longitude: params.longitude,
      timezone: params.timezone,
      location_id: params.location_id,
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch Panchang data');
  }

  return response.data.data;
};

/**
 * Fetch Panchang for a date range (for monthly calendar view)
 *
 * @param params - Date range, coordinates, and timezone
 * @returns Promise<DailyPanchang[]> - Array of daily Panchang data
 *
 * @example
 * const panchangs = await fetchPanchangRange({
 *   start_date: '2026-02-01',
 *   end_date: '2026-02-28',
 *   latitude: 13.0827,
 *   longitude: 80.2707,
 *   timezone: 'Asia/Kolkata'
 * });
 */
export const fetchPanchangRange = async (
  params: FetchPanchangRangeParams
): Promise<DailyPanchang[]> => {
  const response = await apiClient.get<PanchangRangeResponse>('/api/v1/panchang/range', {
    params: {
      start_date: params.start_date,
      end_date: params.end_date,
      latitude: params.latitude,
      longitude: params.longitude,
      timezone: params.timezone,
      location_id: params.location_id,
    },
  });

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch Panchang range');
  }

  return response.data.data;
};
