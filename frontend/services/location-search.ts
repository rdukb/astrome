import type { Location } from '@/types/location';

interface OpenMeteoGeocodeResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  timezone?: string;
}

interface OpenMeteoGeocodeResponse {
  results?: OpenMeteoGeocodeResult[];
}

const toLocation = (result: OpenMeteoGeocodeResult): Location => {
  const displayName = [result.name, result.admin1, result.country].filter(Boolean).join(', ');
  const id = `geo-${result.latitude.toFixed(4)}-${result.longitude.toFixed(4)}-${result.timezone || 'UTC'}`;

  return {
    id,
    name: result.name,
    display_name: displayName,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone || 'UTC',
    country: result.country,
    state: result.admin1 || null,
    is_favorite: false,
    created_at: new Date().toISOString(),
    last_accessed: new Date().toISOString(),
  };
};

export const searchLocations = async (query: string, count = 5): Promise<Location[]> => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', trimmed);
  url.searchParams.set('count', String(count));
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Location search failed (${response.status})`);
  }

  const data = (await response.json()) as OpenMeteoGeocodeResponse;
  return (data.results || []).map(toLocation);
};
