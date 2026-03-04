/**
 * Main Panchang Page
 * Displays daily Tamil Panchangam with all components
 */

'use client';

import { LocationPicker } from '@/components/location/LocationPicker';
import { AuspiciousTimesCard } from '@/components/panchang/AuspiciousTimesCard';
import { DateSelector } from '@/components/panchang/DateSelector';
import { InauspiciousTimesCard } from '@/components/panchang/InauspiciousTimesCard';
import { PanchangCard } from '@/components/panchang/PanchangCard';
import { PanchangSkeleton } from '@/components/panchang/PanchangSkeleton';
import { SunTimesCard } from '@/components/panchang/SunTimesCard';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePanchangStore } from '@/stores/panchang-store';
import type { Location } from '@/types/location';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

const SITE_URL = 'https://astrome.app';
const SEO_SUMMARY =
  'Tamil Panchangam with daily local timings for Rahu Kalam, Gulika Kalam, Yamaganda, Abhijit Muhurat, and sunrise-based Vedic calendar details.';

export default function PanchangPage() {
  const {
    selectedDate,
    selectedLocation,
    currentPanchang,
    isLoading,
    error,
    setSelectedDate,
    setSelectedLocation,
    loadPanchang,
    clearCache,
  } = usePanchangStore();

  const { coordinates, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [pendingUseCurrent, setPendingUseCurrent] = useState(false);

  // Request geolocation on mount if no location is set
  useEffect(() => {
    if (!selectedLocation && !coordinates && !hasRequestedLocation && !geoLoading) {
      requestLocation();
      setHasRequestedLocation(true);
    }
  }, [selectedLocation, coordinates, hasRequestedLocation, geoLoading, requestLocation]);

  // Load Panchang data when date or location changes
  useEffect(() => {
    const location = selectedLocation || coordinates;

    if (location && selectedDate) {
      // Use the location's timezone if available (from selectedLocation)
      // Otherwise, use the browser's timezone (when using geolocation coordinates)
      const timezone = selectedLocation?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

      console.log('[PanchangPage] Loading panchang:', {
        date: selectedDate,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone,
      });

      loadPanchang({
        date: selectedDate,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone,
      });
    }
  }, [selectedDate, selectedLocation, coordinates, loadPanchang]);

  useEffect(() => {
    if (!pendingUseCurrent || !coordinates) return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setSelectedLocation({
      id: `current-${coordinates.latitude.toFixed(4)}-${coordinates.longitude.toFixed(4)}`,
      name: 'Current Location',
      display_name: `Current Location (${coordinates.latitude.toFixed(3)}, ${coordinates.longitude.toFixed(3)})`,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      timezone,
      country: 'Unknown',
      state: null,
      is_favorite: false,
      created_at: new Date().toISOString(),
      last_accessed: new Date().toISOString(),
    });
    setPendingUseCurrent(false);
  }, [pendingUseCurrent, coordinates, setSelectedLocation]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleUseCurrentLocation = () => {
    setPendingUseCurrent(true);
    requestLocation();
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await clearCache();

      const location = selectedLocation || coordinates;
      if (location) {
        await loadPanchang({
          date: selectedDate,
          latitude: location.latitude,
          longitude: location.longitude,
          timezone: selectedLocation?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      }
    } finally {
      setIsClearingCache(false);
    }
  };

  // Show loading skeleton
  if ((isLoading || geoLoading) && !currentPanchang) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">
              Tamil Panchangam
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-300 font-medium">
              Loading today&apos;s almanac...
            </p>
          </header>
          <PanchangSkeleton />
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !currentPanchang) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-white text-center">
              Tamil Panchangam
            </h1>
          </header>
          <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-6 text-center backdrop-blur-sm">
            <div className="text-red-400 mb-2">
              <svg
                className="w-12 h-12 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-slate-100">Error Loading Panchang</h2>
            </div>
            <p className="text-red-300 mb-4">{error}</p>
            <div className="text-sm text-slate-300 mb-4">
              <p>Backend URL: {process.env.NEXT_PUBLIC_API_URL || '/api (via proxy)'}</p>
              <p>Make sure the backend server is reachable</p>
            </div>
            <button
              onClick={() => {
                const location = selectedLocation || coordinates;
                if (location) {
                  loadPanchang({
                    date: selectedDate,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    timezone: selectedLocation?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
                  });
                }
              }}
              className="px-4 py-2 bg-slate-800/70 text-white rounded-lg hover:bg-slate-700/80 transition-colors border border-slate-600/60"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 overflow-y-auto py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.2, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="relative z-10 max-w-[1600px] mx-auto">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Astrome',
              url: SITE_URL,
              description: SEO_SUMMARY,
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Astrome Tamil Panchangam',
              applicationCategory: 'UtilitiesApplication',
              operatingSystem: 'Web',
              url: SITE_URL,
              description: SEO_SUMMARY,
            }),
          }}
        />

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-center"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-2">
            Tamil Panchangam
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-300 font-medium">
            Daily Vedic Almanac for Auspicious Timing
          </p>
          <div className="mt-4">
            <button
              onClick={handleClearCache}
              disabled={isClearingCache}
              className="inline-flex items-center rounded-lg border border-slate-700/60 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800/70 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isClearingCache ? 'Clearing Cache...' : 'Clear Cache & Refresh'}
            </button>
          </div>
        </motion.header>

        <section className="mx-auto mb-6 max-w-4xl text-center">
          <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
            Astrome provides a daily Tamil Panchangam with accurate location-based timings for
            Rahu Kalam, Gulika Kalam, and Yamaganda, along with Tithi, Nakshatra, Yoga, Karana,
            sunrise, and auspicious Muhurat periods.
          </p>
        </section>

        {/* Location and Date */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 flex flex-wrap items-center justify-center gap-4"
        >
          <LocationPicker
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            onUseCurrentLocation={handleUseCurrentLocation}
          />
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </motion.div>

        {!selectedLocation && !coordinates && !geoLoading && (
          <section className="mx-auto mb-6 max-w-3xl rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 text-center backdrop-blur">
            <p className="text-sm text-slate-200">
              Allow location for precise local timings, or search a city manually above.
            </p>
            {geoError?.code === 1 && (
              <p className="mt-2 text-xs text-amber-300">
                Location permission is blocked in your browser. Use the lock/site settings icon in
                the address bar to allow location, then try again.
              </p>
            )}
            <button
              onClick={requestLocation}
              className="mt-3 rounded-lg border border-cyan-500/40 bg-cyan-500/20 px-4 py-2 text-sm font-medium text-cyan-200 transition-colors hover:bg-cyan-500/30"
            >
              {geoError?.code === 1 ? 'Try Location Again' : 'Enable Location'}
            </button>
          </section>
        )}

        {/* Panchang Content */}
        {currentPanchang && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            <div className="space-y-4 lg:space-y-5">
              <PanchangCard panchang={currentPanchang} />
            </div>
            <div className="space-y-4 lg:space-y-5">
              <SunTimesCard panchang={currentPanchang} />
              <AuspiciousTimesCard panchang={currentPanchang} />
            </div>
            <div className="space-y-4 lg:space-y-5">
              <InauspiciousTimesCard panchang={currentPanchang} />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
