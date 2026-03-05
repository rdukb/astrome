/**
 * GA4 Analytics — Type-safe event helpers
 *
 * Privacy rules:
 *  - No PII (no email, name, user ID).
 *  - No raw GPS coordinates.
 *  - All helpers no-op when NEXT_PUBLIC_GA_MEASUREMENT_ID is absent (dev / test).
 *
 * Setup: set NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX in .env.production.
 * See docs/observability/analytics-ga4.md for full schema documentation.
 */

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      params?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/** True only in browser with gtag loaded and measurement ID configured. */
function canTrack(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.gtag === 'function' &&
    Boolean(GA_ID)
  );
}

/** Returns today's date as YYYY-MM-DD in the local timezone. */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Signed days between two YYYY-MM-DD strings (b − a). */
export function diffDays(dateStr: string, referenceStr: string = today()): number {
  const MS_PER_DAY = 86_400_000;
  const a = new Date(referenceStr).getTime();
  const b = new Date(dateStr).getTime();
  return Math.round((b - a) / MS_PER_DAY);
}

/** Coarsely bucket an error string into one of the GA4 error_type values. */
export function classifyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('network') || m.includes('fetch') || m.includes('failed to fetch')) {
    return 'network';
  }
  if (m.includes('timeout') || m.includes('408') || m.includes('504')) {
    return 'timeout';
  }
  if (m.includes('404')) {
    return 'not_found';
  }
  if (m.includes('500') || m.includes('502') || m.includes('503')) {
    return 'server';
  }
  return 'unknown';
}

// ---------------------------------------------------------------------------
// Public event functions
// ---------------------------------------------------------------------------

/**
 * Fired when panchang data is rendered successfully for a date + location.
 *
 * Trigger: page.tsx — after loadPanchang resolves and currentPanchang is set.
 */
export function trackPanchangViewLoaded(params: {
  date: string;
  location_label: string;
  days_from_today: number;
}): void {
  if (!canTrack()) return;
  window.gtag('event', 'panchang_view_loaded', params);
}

/**
 * Fired when the user chooses a location (manual search or geolocation).
 *
 * Trigger: page.tsx — handleSelectLocation + pendingUseCurrent effect.
 */
export function trackLocationSelected(params: {
  method: 'manual' | 'geolocation';
  location_label: string;
}): void {
  if (!canTrack()) return;
  window.gtag('event', 'location_selected', params);
}

/**
 * Fired when the user changes the date via DateSelector.
 *
 * Trigger: page.tsx — handleDateChange.
 */
export function trackDateChanged(params: {
  date: string;
  days_from_today: number;
}): void {
  if (!canTrack()) return;
  window.gtag('event', 'date_changed', params);
}

/**
 * Fired when the full-page error state is shown (API failure, no cache fallback).
 *
 * Trigger: page.tsx — useEffect on [error, currentPanchang].
 */
export function trackApiErrorShown(params: {
  error_type: string;
  date: string;
  location_label: string;
}): void {
  if (!canTrack()) return;
  window.gtag('event', 'api_error_shown', params);
}
