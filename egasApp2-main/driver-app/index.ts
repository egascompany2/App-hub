import 'expo-router/entry';

import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';

import { handleDriverRemoteMessage, handleNotifeeBackgroundEvent } from '@/lib/notifications';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  await handleDriverRemoteMessage(remoteMessage);
});

notifee.onBackgroundEvent(async event => {
  await handleNotifeeBackgroundEvent(event);
});
