# Firebase Cloud Messaging (FCM) Notification System

This document describes the robust Firebase Cloud Messaging notification system implemented for the E-gas delivery platform using the HTTP v1 API.

## Overview

The notification system provides real-time communication between:
- **Backend Server** → **Driver App**
- **Backend Server** → **User App**
- **Driver App** → **User App** (via backend)

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Backend API   │    │   Firebase FCM   │    │   Mobile Apps   │
│                 │    │                  │    │                 │
│ • Order Service │───▶│ • HTTP v1 API    │───▶│ • Driver App    │
│ • Auth Service  │    │ • Topic Mgmt     │    │ • User App      │
│ • Notification  │    │ • Token Mgmt     │    │                 │
│   Service       │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Features

### 🔔 Real-time Notifications
- **Order Status Updates**: Pending, Assigned, Accepted, In Transit, Delivered, Cancelled
- **Driver Assignment**: Instant notification when driver is assigned
- **Location Updates**: Real-time driver location and ETA updates
- **Payment Confirmations**: Payment status notifications
- **Emergency Alerts**: High-priority emergency notifications

### 📱 Cross-Platform Support
- **Android**: Native FCM integration with custom notification channels
- **iOS**: APNs integration through Firebase
- **Web**: Web push notifications (future enhancement)

### 🚀 Advanced Features
- **Topic Management**: Subscribe/unsubscribe to specific notification topics
- **Priority Handling**: High-priority notifications for critical updates
- **Background Processing**: Handle notifications when app is in background
- **Token Management**: Automatic FCM token registration and validation
- **Retry Logic**: Robust error handling with retry mechanisms

## Backend Implementation

### 1. Firebase Configuration (`src/config/firebase.ts`)
```typescript
import * as admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  projectId: 'egasadmin',
});
```

### 2. Notification Service (`src/services/notification.ts`)
The core service provides methods for:
- `sendToDevice()`: Send to single device
- `sendToMultipleDevices()`: Send to multiple devices
- `sendToTopic()`: Send to topic subscribers
- `subscribeToTopic()`: Subscribe devices to topics
- `unsubscribeFromTopic()`: Unsubscribe from topics

### 3. Order Status Notifications
```typescript
await notificationService.sendOrderStatusNotification(
  orderId,
  status,
  customerToken,
  driverToken
);
```

### 4. API Endpoints (`src/routes/notification.ts`)
- `POST /api/notifications/register-token` - Register FCM token
- `DELETE /api/notifications/unregister-token/:userId` - Unregister token
- `POST /api/notifications/send-test/:userId` - Send test notification
- `POST /api/notifications/send-bulk` - Send to multiple users
- `POST /api/notifications/subscribe-topic/:userId` - Subscribe to topic
- `GET /api/notifications/stats` - Get notification statistics

## Mobile App Implementation

### Driver App

#### 1. Notification Service (`lib/notification.ts`)
```typescript
import messaging from '@react-native-firebase/messaging';

// Get FCM token
const fcmToken = await messaging().getToken();

// Handle background messages
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Background message:', remoteMessage);
  return Promise.resolve();
});
```

#### 2. Notification Hook (`hooks/useNotifications.ts`)
```typescript
export const useNotifications = () => {
  // Register FCM token with backend
  const registerFCMToken = async (token: string) => {
    await api.post('/notifications/register-token', {
      userId: user.id,
      token,
      deviceType: 'mobile',
      appType: 'driver',
    });
  };

  // Handle different notification types
  const handleNotification = (message: NotificationMessage) => {
    switch (data.type) {
      case 'order_assignment':
        // Handle new order assignment
        break;
      case 'order_status_update':
        // Handle status updates
        break;
    }
  };

  return { registerFCMToken, handleNotification };
};
```

### User App

Similar implementation with user-specific notification handling:
- Order status updates
- Driver location updates
- Payment confirmations
- Emergency alerts

## Database Schema Updates

### User Table
```sql
ALTER TABLE "User" ADD COLUMN "fcmToken" TEXT;
ALTER TABLE "User" ADD COLUMN "deviceType" TEXT;
ALTER TABLE "User" ADD COLUMN "appType" TEXT;
ALTER TABLE "User" ADD COLUMN "lastTokenUpdate" TIMESTAMP;
```

## Notification Types & Payloads

### 1. Order Status Updates
```json
{
  "title": "Order Update",
  "body": "Your order status has been updated to ASSIGNED",
  "data": {
    "orderId": "order_123",
    "status": "ASSIGNED",
    "type": "order_status"
  }
}
```

### 2. Driver Assignment
```json
{
  "title": "Order Assigned! 🎯",
  "body": "Order #123 has been assigned to you. Please accept or decline.",
  "data": {
    "orderId": "order_123",
    "type": "order_assignment"
  }
}
```

### 3. Location Updates
```json
{
  "title": "Driver Update",
  "body": "Your driver is on the way! Estimated arrival: 15 minutes",
  "data": {
    "orderId": "order_123",
    "type": "driver_location",
    "estimatedArrival": "15 minutes"
  }
}
```

### 4. Emergency Alerts
```json
{
  "title": "Emergency Alert",
  "body": "Emergency situation detected. Please contact support immediately.",
  "data": {
    "orderId": "order_123",
    "type": "emergency",
    "priority": "high"
  }
}
```

## Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install firebase-admin
```

### 2. Mobile App Setup
```bash
# Driver App
cd driver-app
npm install @react-native-firebase/messaging

# User App
cd user-app
npm install @react-native-firebase/messaging
```

### 3. Firebase Configuration
1. Download Firebase service account key
2. Place in project root: `egasadmin-firebase-adminsdk-fbsvc-ce1d9aaf55.json`
3. Update Firebase project ID in config

### 4. Environment Variables
```env
FIREBASE_PROJECT_ID=egasadmin
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

## Testing

### 1. Test Notification API
```bash
curl -X POST http://localhost:3000/api/notifications/send-test/user123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "body": "Test notification"}'
```

### 2. Test Topic Subscription
```bash
curl -X POST http://localhost:3000/api/notifications/subscribe-topic/user123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topic": "order_updates"}'
```

## Monitoring & Analytics

### 1. Notification Statistics
```bash
GET /api/notifications/stats
```

Response:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1000,
    "usersWithTokens": 850,
    "usersWithoutTokens": 150,
    "tokenRegistrationRate": 85.0
  }
}
```

### 2. Firebase Console
- Monitor message delivery rates
- Track notification performance
- Analyze user engagement
- Debug delivery issues

## Best Practices

### 1. Token Management
- Register tokens on app launch
- Unregister tokens on logout
- Validate tokens before sending
- Handle token refresh automatically

### 2. Notification Content
- Keep titles under 50 characters
- Keep bodies under 200 characters
- Use clear, actionable language
- Include relevant data for app navigation

### 3. Error Handling
- Implement retry logic for failed sends
- Log all notification attempts
- Handle invalid tokens gracefully
- Monitor delivery success rates

### 4. Performance
- Use batch sending for multiple recipients
- Implement rate limiting
- Cache frequently used data
- Optimize payload size

## Troubleshooting

### Common Issues

1. **Token Not Registered**
   - Check Firebase configuration
   - Verify service account permissions
   - Check network connectivity

2. **Notifications Not Received**
   - Verify app permissions
   - Check device token validity
   - Ensure app is not in battery optimization mode

3. **Background Notifications**
   - Verify background message handler
   - Check app state handling
   - Ensure proper notification channels

### Debug Commands
```bash
# Check Firebase connection
curl -X GET http://localhost:3000/health

# Validate FCM token
curl -X POST http://localhost:3000/api/notifications/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token": "FCM_TOKEN_HERE"}'
```

## Testing the Notification Flow

Automated tests cover the end-to-end lifecycle of order notifications across the backend, driver app, and user app:

- **Backend** (`backend/tests/notificationFlow.test.ts`): Validates that driver assignments and delivery status updates enqueue the correct jobs in the notification queue.
- **Driver App** (`driver-app/__tests__/notifications.test.ts`): Ensures push messages render actionable driver notifications and persistent alarm reminders.
- **User App** (`user-app/__tests__/notifications.test.ts`): Confirms delivery and status notifications are displayed with the right payloads for deep linking.

To execute the test suites:

```bash
# Backend (requires installing dev dependencies once)
cd backend
npm install
npm test

# Driver app (run individual suites without watch mode)
cd ../driver-app
npm test -- --watchAll=false --runTestsByPath __tests__/notifications.test.ts

# User app
cd ../user-app
npm test -- --watchAll=false --runTestsByPath __tests__/notifications.test.ts
```

## Future Enhancements

1. **Rich Notifications**: Images, actions, and custom layouts
2. **Scheduled Notifications**: Send notifications at specific times
3. **A/B Testing**: Test different notification content
4. **Analytics Integration**: Track notification effectiveness
5. **Multi-language Support**: Localized notification content
6. **Smart Targeting**: AI-powered notification timing

## Security Considerations

1. **Token Validation**: Validate FCM tokens before sending
2. **Rate Limiting**: Prevent notification spam
3. **Authentication**: Require valid JWT tokens for API access
4. **Data Encryption**: Encrypt sensitive notification data
5. **Access Control**: Restrict notification sending permissions

## Support

For technical support or questions about the notification system:
- Check Firebase Console for delivery issues
- Review server logs for backend errors
- Test with Firebase Test Lab for mobile issues
- Consult Firebase documentation for API details 
