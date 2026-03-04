/**
 * Day.js configuration with timezone support
 *
 * Provides date/time utilities for Tamil Panchang application with:
 * - Timezone conversion (UTC <-> local)
 * - Indian timezone support (Asia/Kolkata)
 * - Custom formatting
 * - Relative time (e.g., "2 hours ago")
 */

import dayjs, { Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

// Set default timezone to IST (can be overridden per call)
export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

/**
 * Format date in YYYY-MM-DD format
 */
export const formatDate = (date: Date | Dayjs | string): string => {
  return dayjs(date).format('YYYY-MM-DD');
};

/**
 * Format time in 12-hour format with AM/PM
 */
export const formatTime12h = (date: Date | Dayjs | string): string => {
  return dayjs(date).format('h:mm A');
};

/**
 * Format time in 24-hour format
 */
export const formatTime24h = (date: Date | Dayjs | string): string => {
  return dayjs(date).format('HH:mm');
};

/**
 * Format datetime with date and time
 */
export const formatDateTime = (date: Date | Dayjs | string, use24h: boolean = false): string => {
  const timeFormat = use24h ? 'HH:mm' : 'h:mm A';
  return dayjs(date).format(`DD MMM YYYY, ${timeFormat}`);
};

/**
 * Convert UTC datetime to specified timezone
 */
export const utcToTimezone = (
  utcDate: string | Date | Dayjs,
  tz: string = DEFAULT_TIMEZONE
): Dayjs => {
  return dayjs.utc(utcDate).tz(tz);
};

/**
 * Convert local datetime to UTC
 */
export const toUTC = (localDate: string | Date | Dayjs, tz?: string): Dayjs => {
  if (tz) {
    return dayjs.tz(localDate, tz).utc();
  }
  return dayjs(localDate).utc();
};

/**
 * Get current time in specified timezone
 */
export const nowInTimezone = (tz: string = DEFAULT_TIMEZONE): Dayjs => {
  return dayjs().tz(tz);
};

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getToday = (): string => {
  return formatDate(dayjs());
};

/**
 * Parse date string in various formats
 */
export const parseDate = (dateString: string, format?: string): Dayjs => {
  if (format) {
    return dayjs(dateString, format);
  }
  return dayjs(dateString);
};

/**
 * Check if date is today
 */
export const isToday = (date: string | Date | Dayjs): boolean => {
  return dayjs(date).isSame(dayjs(), 'day');
};

/**
 * Check if date is in the past
 */
export const isPast = (date: string | Date | Dayjs): boolean => {
  return dayjs(date).isBefore(dayjs(), 'day');
};

/**
 * Check if date is in the future
 */
export const isFuture = (date: string | Date | Dayjs): boolean => {
  return dayjs(date).isAfter(dayjs(), 'day');
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date | Dayjs): string => {
  return dayjs(date).fromNow();
};

/**
 * Add days to a date
 */
export const addDays = (date: string | Date | Dayjs, days: number): Dayjs => {
  return dayjs(date).add(days, 'day');
};

/**
 * Subtract days from a date
 */
export const subtractDays = (date: string | Date | Dayjs, days: number): Dayjs => {
  return dayjs(date).subtract(days, 'day');
};

/**
 * Get day name (e.g., "Monday")
 */
export const getDayName = (date: string | Date | Dayjs): string => {
  return dayjs(date).format('dddd');
};

/**
 * Get month name (e.g., "January")
 */
export const getMonthName = (date: string | Date | Dayjs): string => {
  return dayjs(date).format('MMMM');
};

/**
 * Calculate duration between two times in minutes
 */
export const getDurationMinutes = (start: string | Date | Dayjs, end: string | Date | Dayjs): number => {
  return dayjs(end).diff(dayjs(start), 'minute');
};

/**
 * Format duration in human-readable format
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr ${mins} min`;
  }
};

// Re-export dayjs for direct use
export { dayjs };
export type { Dayjs };
export default dayjs;
