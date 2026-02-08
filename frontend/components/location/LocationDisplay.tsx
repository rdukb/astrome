/**
 * LocationDisplay Component
 * Shows current location and allows changing location
 */

import type { Location } from '@/types/location';
import React from 'react';

interface LocationDisplayProps {
  location: Location | null;
  coordinates?: { latitude: number; longitude: number } | null;
  timezone?: string;
  onChangeLocation?: () => void;
}

export const LocationDisplay: React.FC<LocationDisplayProps> = ({
  location,
  coordinates,
  timezone,
  onChangeLocation
}) => {
  const formatCoordinates = (latitude: number, longitude: number): string => {
    const latDirection = latitude >= 0 ? 'N' : 'S';
    const lonDirection = longitude >= 0 ? 'E' : 'W';
    return `${Math.abs(latitude).toFixed(4)}°${latDirection}, ${Math.abs(longitude).toFixed(4)}°${lonDirection}`;
  };

  const displayName = location?.display_name || location?.name || 'Current Location';
  const displayCoords = location
    ? formatCoordinates(location.latitude, location.longitude)
    : coordinates
    ? formatCoordinates(coordinates.latitude, coordinates.longitude)
    : 'Loading...';

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-5 border border-gray-200 dark:border-dark-border backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Location Icon */}
          <div className="flex-shrink-0 p-3 bg-purple-100 dark:bg-purple-500/20 rounded-xl">
            <svg
              className="w-7 h-7 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          {/* Location Details */}
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold text-gray-900 dark:text-dark-text-primary truncate mb-1">
              {displayName}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-dark-text-secondary flex items-center gap-2">
              <span className="bg-gray-100 dark:bg-dark-border/50 px-2 py-0.5 rounded">{displayCoords}</span>
            </div>
            {(location?.timezone || timezone) && (
              <div className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1.5 font-medium">
                🌍 {location?.timezone || timezone}
              </div>
            )}
          </div>
        </div>

        {/* Change Location Button */}
        {onChangeLocation && (
          <button
            onClick={onChangeLocation}
            className="ml-3 px-4 py-2.5 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-white hover:bg-purple-600 dark:hover:bg-purple-500 border-2 border-purple-600 dark:border-purple-500 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Change
          </button>
        )}
      </div>
    </div>
  );
};
