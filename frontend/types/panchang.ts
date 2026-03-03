/**
 * TypeScript interfaces for Panchang data structures
 * Matches API schema from panchang-api.yaml
 */

export interface TithiInfo {
  number: number; // 1-30
  name: string;
  name_tamil: string;
  paksha: 'Shukla' | 'Krishna';
  start_time: string; // ISO 8601 datetime
  end_time: string; // ISO 8601 datetime
  at_sunrise: boolean;
}

export interface NakshatraInfo {
  number: number; // 1-27
  name: string;
  name_tamil: string;
  pada: number; // 1-4
  ruling_deity: string;
  start_time: string;
  end_time: string;
  at_sunrise: boolean;
}

export interface YogaInfo {
  number: number; // 1-27
  name: string;
  name_tamil: string;
  start_time?: string;
  end_time?: string;
  at_sunrise?: boolean;
}

export interface KaranaInfo {
  name: string;
  name_tamil: string;
  type: 'Movable' | 'Fixed';
  start_time: string;
  end_time: string;
}

export interface TimePeriod {
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_auspicious: boolean;
}

export interface SpecialDay {
  type: 'Ekadashi' | 'Pradosham' | 'Amavasya' | 'Purnima' | 'Shivaratri' | 'Sankranti' | 'Festival' | 'Auspicious';
  name: string;
  name_tamil: string;
  description: string;
  significance: string;
  observances?: string[];
  fasting_rules?: string | null;
  parana_time?: string | null;
}

export interface DailyPanchang {
  id: string; // UUID
  date: string; // YYYY-MM-DD
  location_id: string; // UUID
  timezone: string; // IANA timezone
  sunrise: string; // ISO 8601 datetime
  sunset: string; // ISO 8601 datetime
  moonrise?: string;  // Optional: not always available (polar latitudes, near new/full moon)
  moonset?: string;   // Optional: not always available
  tithi: TithiInfo;
  nakshatra: NakshatraInfo;
  yoga: YogaInfo;
  karana: KaranaInfo[]; // Usually 2 per day
  rahu_kalam: TimePeriod;
  gulika_kalam: TimePeriod;
  yamaganda_kalam: TimePeriod;
  durmuhurtam: TimePeriod[];
  varjyam?: TimePeriod[];  // Array (backend returns List[TimePeriod] | null); may be absent
  abhijit_muhurat?: TimePeriod; // Not present on all days (e.g. Wednesdays)
  brahma_muhurat: TimePeriod;
  tamil_month: string;
  tamil_year: string;
  paksha: 'Shukla' | 'Krishna';
  special_days: SpecialDay[] | null;
  calculated_at: string; // ISO 8601 datetime
}

export interface PanchangResponse {
  success: boolean;
  data: DailyPanchang;
  message: string;
}

export interface PanchangRangeResponse {
  success: boolean;
  data: DailyPanchang[];
  date_range: {
    start_date: string;
    end_date: string;
  };
  message: string;
}
