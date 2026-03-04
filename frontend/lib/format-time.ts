/**
 * Time Formatting Utilities
 * Functions for formatting time with timezone support and 12/24hr formats
 */

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export interface TimeFormatOptions {
  format24Hour?: boolean;
  showSeconds?: boolean;
  timezone?: string;
  locale?: string;
}

/**
 * Parse API datetime robustly:
 * - If timezone info exists, respect it.
 * - If missing timezone, treat value as UTC (backend standard).
 */
function parseApiDateTime(value: string) {
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(value);
  return hasTimezone ? dayjs(value) : dayjs.utc(value);
}

/**
 * Format ISO 8601 time string to human-readable format
 * @param isoString - ISO 8601 datetime string (e.g., "2026-02-07T06:15:00+05:30")
 * @param options - Formatting options
 * @returns Formatted time string (e.g., "6:15 AM" or "06:15")
 */
export function formatTime(isoString: string, options: TimeFormatOptions = {}): string {
  const {
    format24Hour = false,
    showSeconds = false,
    timezone: tz,
  } = options;

  let time = parseApiDateTime(isoString);

  if (tz) {
    time = time.tz(tz);
  }

  if (format24Hour) {
    return time.format(showSeconds ? 'HH:mm:ss' : 'HH:mm');
  } else {
    return time.format(showSeconds ? 'h:mm:ss A' : 'h:mm A');
  }
}

/**
 * Format time range (start - end)
 * @param startTime - Start time ISO string
 * @param endTime - End time ISO string
 * @param options - Formatting options
 * @returns Formatted range (e.g., "6:15 AM - 7:45 AM")
 */
export function formatTimeRange(
  startTime: string,
  endTime: string,
  options: TimeFormatOptions = {}
): string {
  const start = formatTime(startTime, options);
  const end = formatTime(endTime, options);
  return `${start} - ${end}`;
}

/**
 * Calculate duration between two times
 * @param startTime - Start time ISO string
 * @param endTime - End time ISO string
 * @returns Duration in minutes
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const start = parseApiDateTime(startTime);
  const end = parseApiDateTime(endTime);
  return end.diff(start, 'minute');
}

/**
 * Format duration in minutes to human-readable format
 * @param minutes - Duration in minutes
 * @param longFormat - Use long format (e.g., "2 hours 30 minutes" vs "2h 30m")
 * @returns Formatted duration
 */
export function formatDuration(minutes: number, longFormat = false): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (longFormat) {
    if (hours > 0 && mins > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
    }
  } else {
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  }
}

/**
 * Check if a time falls within a time range
 * @param time - Time to check (ISO string)
 * @param startTime - Range start (ISO string)
 * @param endTime - Range end (ISO string)
 * @returns True if time is within range
 */
export function isWithinTimeRange(
  time: string,
  startTime: string,
  endTime: string
): boolean {
  const checkTime = parseApiDateTime(time);
  const start = parseApiDateTime(startTime);
  const end = parseApiDateTime(endTime);

  return checkTime.isAfter(start) && checkTime.isBefore(end);
}

/**
 * Convert time to specific timezone
 * @param isoString - ISO 8601 datetime string
 * @param targetTimezone - Target timezone (e.g., "Asia/Kolkata")
 * @returns ISO string in target timezone
 */
export function convertTimezone(isoString: string, targetTimezone: string): string {
  return parseApiDateTime(isoString).tz(targetTimezone).toISOString();
}

/**
 * Get current time in specific timezone
 * @param timezone - Timezone (e.g., "Asia/Kolkata")
 * @param options - Formatting options
 * @returns Formatted current time
 */
export function getCurrentTime(timezone?: string, options: TimeFormatOptions = {}): string {
  let now = dayjs();

  if (timezone) {
    now = now.tz(timezone);
  }

  const {
    format24Hour = false,
    showSeconds = false,
  } = options;

  if (format24Hour) {
    return now.format(showSeconds ? 'HH:mm:ss' : 'HH:mm');
  } else {
    return now.format(showSeconds ? 'h:mm:ss A' : 'h:mm A');
  }
}

/**
 * Parse time string to dayjs object
 * @param timeString - Time string in various formats
 * @param timezone - Optional timezone
 * @returns Dayjs object
 */
export function parseTime(timeString: string, timezone?: string) {
  if (timezone) {
    const parsed = parseApiDateTime(timeString);
    return parsed.tz(timezone);
  }
  return parseApiDateTime(timeString);
}

/**
 * Format time for display in India (IST)
 * @param isoString - ISO 8601 datetime string
 * @param format24Hour - Use 24-hour format
 * @returns Formatted time in IST
 */
export function formatIndianTime(isoString: string, format24Hour = false): string {
  return formatTime(isoString, {
    format24Hour,
    timezone: 'Asia/Kolkata',
  });
}
