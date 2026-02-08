/**
 * TypeScript type definitions for Tamil Panchang API
 *
 * Based on OpenAPI specification in panchang-api.yaml
 *
 * Provides type safety for:
 * - API request/response models
 * - Panchang entities (Tithi, Nakshatra, Yoga, Karana)
 * - Location and term definition schemas
 */

// ============================================================================
// Core Panchang Types
// ============================================================================

export interface TimePeriod {
  start: string; // ISO 8601 datetime
  end: string; // ISO 8601 datetime
  duration_minutes?: number;
}

export interface TithiInfo {
  number: number; // 1-30
  name_en: string;
  name_ta: string;
  paksha: 'Shukla' | 'Krishna';
  is_auspicious: boolean;
  start_time: string; // ISO 8601 datetime
  end_time: string; // ISO 8601 datetime
}

export interface NakshatraInfo {
  number: number; // 1-27
  name_en: string;
  name_ta: string;
  pada: number; // 1-4
  ruling_deity_en: string;
  ruling_deity_ta: string;
  start_time: string; // ISO 8601 datetime
  end_time: string; // ISO 8601 datetime
}

export interface YogaInfo {
  number: number; // 1-27
  name_en: string;
  name_ta: string;
  is_auspicious: boolean;
  start_time: string; // ISO 8601 datetime
  end_time: string; // ISO 8601 datetime
}

export interface KaranaInfo {
  number: number; // 1-15
  name_en: string;
  name_ta: string;
  is_fixed: boolean;
  start_time: string; // ISO 8601 datetime
  end_time: string; // ISO 8601 datetime
}

export interface SpecialDay {
  type: string; // ekadashi, pradosham, amavasya, purnima, etc.
  name_en: string;
  name_ta: string;
  description_en?: string;
  description_ta?: string;
  observance_time?: TimePeriod;
}

export interface DailyPanchang {
  id: string; // UUID
  date: string; // YYYY-MM-DD
  location: Location;
  timezone: string; // IANA timezone
  sunrise: string; // ISO 8601 datetime
  sunset: string; // ISO 8601 datetime
  moonrise?: string; // ISO 8601 datetime
  moonset?: string; // ISO 8601 datetime
  tithi: TithiInfo;
  nakshatra: NakshatraInfo;
  yoga: YogaInfo;
  karana: KaranaInfo[];
  rahu_kalam: TimePeriod;
  gulika_kalam: TimePeriod;
  yamaganda_kalam: TimePeriod;
  abhijit_muhurat?: TimePeriod;
  brahma_muhurat: TimePeriod;
  varjyam?: TimePeriod[];
  durmuhurtam: TimePeriod[];
  tamil_month: string;
  tamil_year: string;
  paksha: 'Shukla' | 'Krishna';
  special_days?: SpecialDay[];
  calculated_at: string; // ISO 8601 datetime
}

// ============================================================================
// Location Types
// ============================================================================

export interface Location {
  id: string; // UUID
  name: string;
  display_name: string;
  latitude: number; // -90 to 90
  longitude: number; // -180 to 180
  timezone: string; // IANA timezone
  country: string; // ISO 3166-1 alpha-2
  state?: string;
  is_preloaded: boolean;
}

export interface LocationSearchQuery {
  query: string;
  limit?: number;
}

export interface NearbyLocationQuery {
  latitude: number;
  longitude: number;
  radius_km?: number;
  limit?: number;
}

// ============================================================================
// Term Definition Types
// ============================================================================

export interface TermDefinition {
  id: string; // UUID
  term_id: string; // Slug identifier
  name_en: string;
  name_ta: string;
  short_definition_en: string;
  short_definition_ta: string;
  detailed_explanation_en: string;
  detailed_explanation_ta: string;
  significance_iyengar?: string;
  calculation_method?: string;
  related_terms?: string[];
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface PanchangRequest {
  date: string; // YYYY-MM-DD
  location_id: string; // UUID
}

export interface PanchangRangeRequest {
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  location_id: string; // UUID
}

export interface PanchangResponse {
  data: DailyPanchang;
  cached: boolean;
  cache_expires_at?: string;
}

export interface PanchangRangeResponse {
  data: DailyPanchang[];
  start_date: string;
  end_date: string;
  total_days: number;
}

export interface LocationsResponse {
  data: Location[];
  total: number;
}

export interface TermDefinitionsResponse {
  data: TermDefinition[];
  total: number;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  version: string;
  ephemeris: {
    initialized: boolean;
    using_builtin: boolean;
    path: string;
  };
  database: {
    url: string;
  };
}

// ============================================================================
// Error Types
// ============================================================================

export interface APIError {
  status_code: number;
  message: string;
  details?: any;
  request_id?: string;
}

export interface APIErrorResponse {
  error: APIError;
}

// ============================================================================
// User Preferences (Local State)
// ============================================================================

export interface UserPreferences {
  language: 'en' | 'ta';
  theme: 'light' | 'dark' | 'system';
  location?: Location;
  favorite_locations: string[]; // Array of location IDs
  date_format: 'dmy' | 'mdy' | 'ymd';
  time_format: '12h' | '24h';
  show_tamil_names: boolean;
  offline_range_days: number; // ±days to cache
}
