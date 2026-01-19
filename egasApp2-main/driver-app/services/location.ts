import * as Location from 'expo-location';
import { driverService } from './driver';
import { socketService } from './socket';

export const locationService = {
  async requestPermissions() {
    const current = await Location.getForegroundPermissionsAsync();
    if (current.status === 'granted') {
      return 'granted';
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }
    return status;
  },

  async startTracking(
    orderId: string | null,
    onLocationUpdate?: (location: Location.LocationObject) => void
  ) {
    await this.requestPermissions();

    return Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 3000,
        distanceInterval: 10,
        mayShowUserSettingsDialog: true,
      },
      async (location) => {
        try {
          // Update location in backend
          await driverService.updateLocation({
            currentLat: location.coords.latitude,
            currentLong: location.coords.longitude,
          });

          // If there's an active order, emit location through socket
          if (orderId && socketService.isConnected()) {
            socketService.emitLocationUpdate({
              orderId,
              driverLocation: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }
            });
          }

          onLocationUpdate?.(location);
        } catch (error) {
          console.error('Failed to update location:', error);
        }
      }
    );
  },

  async stopTracking(subscription: Location.LocationSubscription) {
    if (subscription) {
      await subscription.remove();
    }
  }
}; 
