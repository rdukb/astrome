/**
 * LocationDisplay Component
 * Shows current location and allows changing location
 */

import type { Location } from '@/types/location';
import { MapPin } from 'lucide-react';
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
    <div className="bg-slate-800/60 rounded-xl shadow-lg p-5 border border-slate-700/50 backdrop-blur-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Location Icon */}
          <div className="flex-shrink-0 p-3 bg-cyan-500/10 rounded-xl">
            <MapPin className="h-7 w-7 text-cyan-400" />
          </div>

          {/* Location Details */}
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold text-slate-100 truncate mb-1">
              {displayName}
            </div>
            <div className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <span className="bg-slate-700/40 px-2 py-0.5 rounded">{displayCoords}</span>
            </div>
            {(location?.timezone || timezone) && (
              <div className="text-xs text-slate-400 mt-1.5 font-medium">
                🌍 {location?.timezone || timezone}
              </div>
            )}
          </div>
        </div>

        {/* Change Location Button */}
        {onChangeLocation && (
          <button
            onClick={onChangeLocation}
            className="ml-3 px-4 py-2.5 text-sm font-semibold text-cyan-300 hover:text-white hover:bg-cyan-500 border border-cyan-500/60 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Change
          </button>
        )}
      </div>
    </div>
  );
};
