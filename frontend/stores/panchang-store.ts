/**
 * Zustand Store for Tamil Panchang Application
 *
 * Manages client-side state for:
 * - Current Panchang data
 * - Selected location
 * - User preferences
 * - UI state (loading, errors)
 */

import { fetchDailyPanchang, type FetchDailyPanchangParams } from '@/services/panchang-api';
import type { UserPreferences } from '@/types/api';
import type { Location } from '@/types/location';
import type { DailyPanchang } from '@/types/panchang';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

interface PanchangState {
  // Panchang data
  currentPanchang: DailyPanchang | null;
  selectedDate: string; // YYYY-MM-DD

  // Location
  selectedLocation: Location | null;

  // User preferences
  preferences: UserPreferences;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Cache (in-memory for performance)
  cache: Record<string, DailyPanchang>; // Key: "YYYY-MM-DD_lat_lon"

  // Actions
  setCurrentPanchang: (panchang: DailyPanchang | null) => void;
  setSelectedDate: (date: string) => void;
  setSelectedLocation: (location: Location | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  loadPanchang: (params: Omit<FetchDailyPanchangParams, 'location_id'>) => Promise<void>;
  clearCache: () => Promise<void>;
  getCacheKey: (date: string, latitude: number, longitude: number, timezone: string) => string;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  language: 'en',
  theme: 'system',
  favorite_locations: [],
  date_format: 'dmy',
  time_format: '12h',
  show_tamil_names: true,
  offline_range_days: 30,
};

// Get today's date in YYYY-MM-DD format
const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CACHE_KEY_VERSION = 'v2';

/**
 * Create cache key for Panchang data
 */
const createCacheKey = (date: string, latitude: number, longitude: number, timezone: string): string => {
  // Round coordinates to 2 decimal places for cache key (±1.1km precision)
  const lat = latitude.toFixed(2);
  const lon = longitude.toFixed(2);
  // Include timezone in cache key to invalidate cache when timezone changes
  return `${CACHE_KEY_VERSION}_${date}_${lat}_${lon}_${timezone}`;
};

/**
 * Panchang Store
 *
 * Persists preferences and location to localStorage.
 * Does NOT persist Panchang data (fetched fresh from API/cache).
 */
export const usePanchangStore = create<PanchangState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentPanchang: null,
        selectedDate: getTodayString(),
        selectedLocation: null,
        preferences: defaultPreferences,
        isLoading: false,
        error: null,
        cache: {},

        // Actions
        setCurrentPanchang: (panchang) =>
          set({ currentPanchang: panchang, error: null }),

        setSelectedDate: (date) =>
          set({ selectedDate: date, currentPanchang: null }),

        setSelectedLocation: (location) =>
          set({ selectedLocation: location, currentPanchang: null }),

        updatePreferences: (newPreferences) =>
          set((state) => ({
            preferences: { ...state.preferences, ...newPreferences },
          })),

        setLoading: (loading) =>
          set({ isLoading: loading }),

        setError: (error) =>
          set({ error, isLoading: false }),

        reset: () =>
          set({
            currentPanchang: null,
            selectedDate: getTodayString(),
            selectedLocation: null,
            preferences: defaultPreferences,
            isLoading: false,
            error: null,
            cache: {},
          }),

        // Load Panchang data (with caching)
        loadPanchang: async (params: Omit<FetchDailyPanchangParams, 'location_id'>) => {
          const { date, latitude, longitude, timezone } = params;
          const cacheKey = createCacheKey(date, latitude, longitude, timezone);

          // Check cache first
          const cached = get().cache[cacheKey];
          if (cached) {
            console.log('[PanchangStore] Cache hit:', cacheKey);
            set({
              currentPanchang: cached,
              isLoading: false,
              error: null
            });
            return;
          }

          // Fetch from API
          set({ isLoading: true, error: null });

          try {
            const location_id = get().selectedLocation?.id;
            const panchang = await fetchDailyPanchang({
              date,
              latitude,
              longitude,
              timezone,
              location_id,
            });

            // Update state and cache
            set((state) => ({
              currentPanchang: panchang,
              isLoading: false,
              error: null,
              cache: {
                ...state.cache,
                [cacheKey]: panchang,
              },
            }));

            console.log('[PanchangStore] Fetched and cached:', cacheKey);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load Panchang';
            set({
              isLoading: false,
              error: errorMessage,
              currentPanchang: null
            });
            console.error('[PanchangStore] Error:', errorMessage);
          }
        },

        // Clear cache
        clearCache: async () => {
          set({ cache: {}, currentPanchang: null });

          if (typeof window !== 'undefined' && 'caches' in window) {
            try {
              const cacheNames = await window.caches.keys();
              await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
              console.log('[PanchangStore] Browser CacheStorage cleared:', cacheNames);
            } catch (error) {
              console.warn('[PanchangStore] Failed to clear CacheStorage:', error);
            }
          }

          console.log('[PanchangStore] Cache cleared');
        },

        // Helper: Get cache key
        getCacheKey: (date: string, latitude: number, longitude: number, timezone: string) =>
          createCacheKey(date, latitude, longitude, timezone),
      }),
      {
        name: 'panchang-store',
        storage: createJSONStorage(() => localStorage),
        version: 4,
        migrate: (persistedState: unknown) => {
          const state = (persistedState as Partial<PanchangState>) || {};
          return {
            ...state,
            // Always normalize to local "today" on hydration to avoid stale UTC-shifted dates.
            selectedDate: getTodayString(),
            // Invalidate stale cached timings after calculation logic updates.
            cache: {},
          } as PanchangState;
        },
        // Only persist non-sensitive data
        partialize: (state) => ({
          selectedLocation: state.selectedLocation,
          preferences: state.preferences,
          // Cache can be persisted for offline support
          cache: state.cache,
        }),
      }
    ),
    {
      name: 'PanchangStore',
    }
  )
);

/**
 * Selectors for common state patterns
 */
export const selectPanchangData = (state: PanchangState) => state.currentPanchang;
export const selectSelectedDate = (state: PanchangState) => state.selectedDate;
export const selectSelectedLocation = (state: PanchangState) => state.selectedLocation;
export const selectPreferences = (state: PanchangState) => state.preferences;
export const selectIsLoading = (state: PanchangState) => state.isLoading;
export const selectError = (state: PanchangState) => state.error;
