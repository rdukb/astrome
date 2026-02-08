/**
 * useGeolocation Hook
 * Provides browser geolocation API access with state management
 */

import { useEffect, useState } from 'react';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeolocationState {
  coordinates: GeolocationCoordinates | null;
  loading: boolean;
  error: GeolocationPositionError | null;
  supported: boolean;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

/**
 * Hook to access browser geolocation
 *
 * @param options - Geolocation API options
 * @returns GeolocationState with coordinates, loading, error
 *
 * @example
 * const { coordinates, loading, error } = useGeolocation();
 *
 * if (loading) return <div>Loading location...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (coordinates) {
 *   return <div>Lat: {coordinates.latitude}, Lon: {coordinates.longitude}</div>;
 * }
 */
export const useGeolocation = (
  options: UseGeolocationOptions = {}
): GeolocationState & { requestLocation: () => void } => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false,
    error: null,
    supported: typeof window !== 'undefined' && 'geolocation' in navigator,
  });

  const requestLocation = () => {
    if (!state.supported) {
      setState((prev) => ({
        ...prev,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 10000, // 10 seconds
      maximumAge: options.maximumAge ?? 0,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          loading: false,
          error: null,
          supported: true,
        });
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error,
        }));
      },
      defaultOptions
    );
  };

  return {
    ...state,
    requestLocation,
  };
};

/**
 * Hook to watch geolocation changes (continuous tracking)
 *
 * @param options - Geolocation API options
 * @returns GeolocationState with coordinates, loading, error
 */
export const useGeolocationWatch = (
  options: UseGeolocationOptions = {}
): GeolocationState => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: true,
    error: null,
    supported: typeof window !== 'undefined' && 'geolocation' in navigator,
  });

  useEffect(() => {
    if (!state.supported) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        } as GeolocationPositionError,
      }));
      return;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 0,
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          loading: false,
          error: null,
          supported: true,
        });
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          loading: false,
          error,
        }));
      },
      defaultOptions
    );

    // Cleanup on unmount
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge, state.supported]);

  return state;
};
