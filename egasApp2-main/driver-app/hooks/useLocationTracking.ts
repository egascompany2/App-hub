import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { locationService } from '../services/location';
import { useUpdateLocation } from './useDriver';
import { useProfile } from './useProfile';
import { useLocationDisclosure } from './useLocationDisclosure';

export function useLocationTracking(orderId: string | null = null) {
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const updateLocation = useUpdateLocation();
  const { data: profile } = useProfile();
  const { ensurePermission, disclosureModal } = useLocationDisclosure();

  useEffect(() => {
    const startTracking = async () => {
      try {
        setError(null);

        const consent = await ensurePermission();
        if (!consent) {
          setError('Allow location to enable delivery tracking and navigation, but location-based features will be limited.');
          setIsTracking(false);
          return;
        }
        
        // Start location tracking
        locationSubscription.current = await locationService.startTracking(
          orderId,
          (location) => {
            setCurrentLocation(location);
            setIsTracking(true);
          }
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start location tracking');
        setIsTracking(false);
      }
    };

    if (profile?.profile.isAvailable) {
      startTracking();
    }

    return () => {
      if (locationSubscription.current) {
        locationService.stopTracking(locationSubscription.current);
        locationSubscription.current = null;
        setIsTracking(false);
      }
    };
  }, [profile?.profile.isAvailable, orderId]);

  return {
    isTracking,
    error,
    currentLocation,
    disclosureModal,
    ensurePermission,
  };
}
