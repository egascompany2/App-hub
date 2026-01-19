import 'expo-router/entry';

import notifee from '@notifee/react-native';

import {
  handleUserRemoteMessage,
  handleUserNotifeeBackgroundEvent,
} from './lib/notifications';

// Use dynamic imports for Firebase to avoid crashes in Expo Go
let firebase = null;
let messaging = null;

try {
  firebase = require('@react-native-firebase/app').default;
  messaging = require('@react-native-firebase/messaging').default;
  
  if (firebase && !firebase.apps.length) {
    firebase.initializeApp();
  }
  
  if (messaging) {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      await handleUserRemoteMessage(remoteMessage);
    });
  }
} catch (error) {
  console.warn('Firebase not available (Expo Go mode). Push notifications will be disabled.', error);
}

notifee.onBackgroundEvent(async event => {
  await handleUserNotifeeBackgroundEvent(event);
});
