# GA4 Analytics — Event Schema & Implementation

## Overview

Astrome uses Google Analytics 4 (GA4) for product observability. The instrumentation is
minimal and privacy-aware: no PII is collected, no personal location coordinates are sent
to GA4, and all calls are no-op when the measurement ID is absent.

---

## Setup

### 1. Create a GA4 property

1. Go to [analytics.google.com](https://analytics.google.com) → Admin → Create Property.
2. Choose **Web** as the platform, enter `https://astrome.app`.
3. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`).

### 2. Set the environment variable

Add to `frontend/.env.production` (and to Firebase Hosting environment via the Firebase
console or `apphosting.yaml` if using App Hosting):

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Leave blank in `frontend/.env.development` to suppress GA in local dev.

### 3. Verify

Open the GA4 **Realtime** report and load `https://astrome.app`. The `panchang_view_loaded`
event should appear within 30 seconds.

---

## Event Schema

All events are fired via `window.gtag('event', name, params)`. The helper module
`frontend/lib/analytics.ts` wraps each call with a type-safe function and guards against
SSR / missing `gtag`.

### `panchang_view_loaded`

Fired when the API response is successfully rendered for the first time after a
location + date combination is resolved.

**Trigger point:** `frontend/app/page.tsx` — inside the `useEffect` that calls
`trackPanchangViewLoaded`, after `currentPanchang` becomes non-null and deduped by date+location key.

| Parameter | Type | Example | Notes |
|---|---|---|---|
| `date` | `string` | `"2026-03-04"` | YYYY-MM-DD, the selected panchang date |
| `location_label` | `string` | `"Chennai"` | `selectedLocation.name` or `"Current Location"` |
| `days_from_today` | `number` | `0` | Negative = past, positive = future |

```ts
trackPanchangViewLoaded({
  date: selectedDate,
  location_label: selectedLocation?.name ?? 'Current Location',
  days_from_today: diffDays(selectedDate),
});
```

---

### `location_selected`

Fired whenever the user chooses a location — either by picking from search results or
by granting browser geolocation.

**Trigger point:** `frontend/app/page.tsx` — `handleSelectLocation` and the
`pendingUseCurrent` effect after geolocation resolves successfully.

| Parameter | Type | Example | Notes |
|---|---|---|---|
| `method` | `"manual" \| "geolocation"` | `"manual"` | How the location was set |
| `location_label` | `string` | `"Chennai"` | `location.name` |

```ts
// manual pick
trackLocationSelected({ method: 'manual', location_label: location.name });

// geolocation resolved
trackLocationSelected({ method: 'geolocation', location_label: 'Current Location' });
```

---

### `date_changed`

Fired when the user navigates to a different date via the `DateSelector`.

**Trigger point:** `frontend/app/page.tsx` — `handleDateChange`.

| Parameter | Type | Example | Notes |
|---|---|---|---|
| `date` | `string` | `"2026-03-05"` | YYYY-MM-DD, the newly selected date |
| `days_from_today` | `number` | `1` | Positive = future, negative = past |

```ts
trackDateChanged({
  date: newDate,
  days_from_today: diffDays(newDate),
});
```

---

### `api_error_shown`

Fired when the full-page error state is rendered (i.e., the API call failed and there is
no cached panchang to fall back to).

**Trigger point:** `frontend/app/page.tsx` — the branch guarded by
`if (error && !currentPanchang)`, using a `useEffect` on `[error, currentPanchang]`.

| Parameter | Type | Example | Notes |
|---|---|---|---|
| `error_type` | `string` | `"network"` | Coarse bucket — see note below |
| `date` | `string` | `"2026-03-04"` | Date that was requested |
| `location_label` | `string` | `"Chennai"` | Active location at time of error |

**`error_type` bucketing** (derive from the error string in `panchang-store.ts`):

| Condition | `error_type` value |
|---|---|
| Contains "network" / "Network" / "fetch" | `"network"` |
| Contains "timeout" / "408" / "504" | `"timeout"` |
| Contains "404" | `"not_found"` |
| Contains "500" / "502" / "503" | `"server"` |
| Any other | `"unknown"` |

```ts
trackApiErrorShown({
  error_type: classifyError(error),
  date: selectedDate,
  location_label: selectedLocation?.name ?? (coordinates ? 'Current Location' : 'unknown'),
});
```

---

## Privacy Considerations

- **No coordinates sent to GA4.** `latitude` / `longitude` are never included in event
  parameters.
- **No user IDs.** Do not call `gtag('config', id, { user_id: ... })`.
- **IP anonymization enabled.** `anonymize_ip: true` is configured in `frontend/app/layout.tsx`.
- **Consent mode.** If you add a cookie banner in the future, integrate
  [GA4 Consent Mode v2](https://support.google.com/analytics/answer/9976101) before
  collecting any data from EU/UK visitors.
- **No-op in dev.** Leave `NEXT_PUBLIC_GA_MEASUREMENT_ID` unset in `.env.development`;
  all `track*` helpers short-circuit when the ID is absent.

---

## GA4 Custom Reports to Create

After events are flowing, create these Exploration reports in GA4:

| Report name | Dimensions | Metrics | Filter |
|---|---|---|---|
| Daily Panchang Loads | `date`, `location_label` | `eventCount` | event = `panchang_view_loaded` |
| Location Method Split | `method` | `eventCount` | event = `location_selected` |
| Date Navigation Heatmap | `days_from_today` | `eventCount` | event = `date_changed` |
| API Error Rate | `error_type`, `date` | `eventCount` | event = `api_error_shown` |
