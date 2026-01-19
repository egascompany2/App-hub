import { Alert } from 'react-native';
import { AxiosError } from 'axios';

export const handleError = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message;
    Alert.alert('Error', message);
    return;
  }

  if (error instanceof Error) {
    Alert.alert('Error', error.message);
    return;
  }

  Alert.alert('Error', 'An unexpected error occurred');
}; 