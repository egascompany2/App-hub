import { useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';
import { useProfile } from './useProfile';
import { useQueryClient } from '@tanstack/react-query';
import { driverKeys } from './useDriver';
import { Order } from '../types/order';
import { Alert } from 'react-native';
import { driverService } from '../services/driver';

export function useSocket() {
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  const handleOrderEvent = useCallback(
    (event: Order | { orderId: string; status: string }) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.current });
      queryClient.invalidateQueries({ queryKey: driverKeys.ongoing });

      if ("id" in event) {
        Alert.alert('New Order', 'You have received a new delivery order!');
      }
    },
    [queryClient]
  );

  const handleReassignment = useCallback(
    (payload: { orderId: string; newDriverName?: string }) => {
      queryClient.invalidateQueries({ queryKey: driverKeys.current });
      queryClient.invalidateQueries({ queryKey: driverKeys.ongoing });

      const message = payload.newDriverName
        ? `This order has been reassigned to ${payload.newDriverName}. Please acknowledge to release it.`
        : 'This order has been reassigned to another driver. Please acknowledge to release it.';

      Alert.alert(
        'Order Reassigned',
        message,
        [
          {
            text: 'Acknowledge',
            onPress: async () => {
              try {
                await driverService.confirmReassignment(payload.orderId);
              } catch (error) {
                console.error('Failed to acknowledge reassignment:', error);
              }
            },
          },
        ],
        { cancelable: false }
      );
    },
    [queryClient]
  );

  useEffect(() => {
    if (!profile?.profile.id) return;

    let unsubscribe: (() => void) | undefined;

    const initSocket = async () => {
      try {
        console.log('Connecting socket for driver:', profile.profile.id);
        await socketService.connect(profile.profile.id);
        unsubscribe = socketService.subscribeToNewOrders(handleOrderEvent, handleReassignment);
      } catch (error) {
        console.error('Socket connection error:', error);
      }
    };

    initSocket();

    return () => {
      console.log('Cleaning up socket connection');
      unsubscribe?.();
      socketService.unsubscribeFromNewOrders();
      socketService.disconnect();
    };
  }, [profile?.profile.id, handleOrderEvent, handleReassignment]);
} 
