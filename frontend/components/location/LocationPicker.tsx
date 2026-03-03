import { searchLocations } from '@/services/location-search';
import type { Location } from '@/types/location';
import { Loader2, MapPin, Search } from 'lucide-react';
import React, { useState } from 'react';

interface LocationPickerProps {
  selectedLocation: Location | null;
  onSelectLocation: (location: Location) => void;
  onUseCurrentLocation: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  selectedLocation,
  onSelectLocation,
  onUseCurrentLocation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setError(null);
    setIsSearching(true);

    try {
      const locations = await searchLocations(query, 6);
      setResults(locations);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search locations';
      setError(message);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePick = (location: Location) => {
    onSelectLocation(location);
    setQuery('');
    setResults([]);
    setError(null);
  };

  return (
    <div className="relative min-w-[20rem]">
      <div className="flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-800/60 px-3 py-2 backdrop-blur-md">
        <MapPin className="h-4 w-4 shrink-0 text-cyan-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              void handleSearch();
            }
          }}
          className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none"
          placeholder={selectedLocation?.display_name || 'Country / State / City'}
          aria-label="Search location by country, state, or city"
        />
        <button
          onClick={() => void handleSearch()}
          className="rounded-md p-1 text-slate-300 transition-colors hover:bg-slate-700/50 hover:text-slate-100"
          aria-label="Search location"
        >
          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
        </button>
        <button
          onClick={onUseCurrentLocation}
          className="rounded-md border border-cyan-500/40 bg-cyan-500/20 px-2 py-1 text-xs font-medium text-cyan-200 transition-colors hover:bg-cyan-500/30"
        >
          Use Current
        </button>
      </div>

      {(results.length > 0 || error) && (
        <div className="absolute z-30 mt-2 w-full rounded-xl border border-slate-700/70 bg-slate-900/95 p-2 shadow-xl">
          {error ? (
            <div className="px-2 py-1 text-xs text-rose-300">{error}</div>
          ) : (
            <ul className="space-y-1">
              {results.map((location) => (
                <li key={location.id}>
                  <button
                    onClick={() => handlePick(location)}
                    className="w-full rounded-lg px-2 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800"
                  >
                    {location.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
