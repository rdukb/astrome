/**
 * TypeScript interfaces for Location data structures
 * Matches API schema from panchang-api.yaml
 */

export interface Location {
  id: string; // UUID
  name: string;
  display_name: string;
  latitude: number; // -66.5 to +66.5
  longitude: number; // -180 to +180
  timezone: string; // IANA timezone (e.g., "Asia/Kolkata")
  country: string;
  state?: string | null;
  is_favorite: boolean;
  last_accessed?: string | null;
  created_at: string;
}

export interface LocationSearchParams {
  query: string;
  limit?: number;
}

export interface LocationSearchResponse {
  locations: Location[];
  count: number;
}

export interface NearbyLocationsParams {
  latitude: number;
  longitude: number;
  radius_km: number;
}

export interface TimezoneResponse {
  timezone: string;
  utc_offset: string;
}
