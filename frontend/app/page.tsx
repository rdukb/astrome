/**
 * Main Panchang Page
 * Displays daily Tamil Panchangam with all components
 */

'use client';

import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher';
import { LocationDisplay } from '@/components/location/LocationDisplay';
import { AuspiciousTimesCard } from '@/components/panchang/AuspiciousTimesCard';
import { DateSelector } from '@/components/panchang/DateSelector';
import { InauspiciousTimesCard } from '@/components/panchang/InauspiciousTimesCard';
import { PanchangCard } from '@/components/panchang/PanchangCard';
import { PanchangSkeleton } from '@/components/panchang/PanchangSkeleton';
import { SunTimesCard } from '@/components/panchang/SunTimesCard';
import { useGeolocation } from '@/hooks/useGeolocation';
import { usePanchangStore } from '@/stores/panchang-store';
import { useEffect, useState } from 'react';

export default function PanchangPage() {
  const {
    selectedDate,
    selectedLocation,
    currentPanchang,
    isLoading,
    error,
    setSelectedDate,
    loadPanchang,
    clearCache,
  } = usePanchangStore();

  const { coordinates, loading: geoLoading, requestLocation } = useGeolocation();
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

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

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
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
      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900 py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-purple-400 dark:to-pink-400 mb-2">
              Tamil Panchangam
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-dark-text-secondary font-medium">
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
      <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-dark-text-primary text-center">
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
              <h2 className="text-xl font-semibold text-dark-text-primary">Error Loading Panchang</h2>
            </div>
            <p className="text-red-300 mb-4">{error}</p>
            <div className="text-sm text-dark-text-secondary mb-4">
              <p>Backend URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}</p>
              <p>Make sure the backend server is running on port 8000</p>
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
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show location request if needed
  if (!coordinates && !selectedLocation && !geoLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 text-center">
              Tamil Panchangam
            </h1>
          </header>
          <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg p-8 text-center max-w-md mx-auto backdrop-blur-sm">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h2 className="text-xl font-semibold text-dark-text-primary mb-2">
              Location Access Required
            </h2>
            <p className="text-dark-text-secondary mb-6">
              We need your location to calculate accurate Panchang times for your area.
            </p>
            <button
              onClick={requestLocation}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              Enable Location
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-indigo-950 dark:via-purple-950 dark:to-slate-900 py-6 px-4 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-purple-400 dark:to-pink-400 mb-2">
            Tamil Panchangam
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-dark-text-secondary font-medium">
            Daily Vedic Almanac for Auspicious Timing
          </p>
          <div className="mt-4">
            <button
              onClick={handleClearCache}
              disabled={isClearingCache}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {isClearingCache ? 'Clearing Cache...' : 'Clear Cache & Refresh'}
            </button>
          </div>
        </header>

        {/* Location and Date */}
        <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
          <LocationDisplay
            location={selectedLocation}
            coordinates={coordinates}
            timezone={selectedLocation?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
          />
          <DateSelector
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
          />
        </div>

        {/* Panchang Content */}
        {currentPanchang && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-5 sm:space-y-6">
              <PanchangCard panchang={currentPanchang} />
              <SunTimesCard panchang={currentPanchang} />
            </div>
            <div className="space-y-5 sm:space-y-6">
              <InauspiciousTimesCard panchang={currentPanchang} />
              <AuspiciousTimesCard panchang={currentPanchang} />
            </div>
          </div>
        )}
      </div>

      {/* Theme Switcher */}
      <ThemeSwitcher />
    </div>
  );
}
