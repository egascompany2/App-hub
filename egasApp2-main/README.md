# eGas

A mobile platform connecting gas delivery drivers with customers, built with React Native and Node.js.

## Overview

eGas is a full-stack mobile application that facilitates on-demand gas delivery services. The platform consists of two main applications:

1. **Customer App**: Allows users to order gas delivery to their location
2. **Driver App**: Enables drivers to accept and fulfill delivery orders

## Features

### Customer App

- Real-time order tracking
- Location-based delivery
- Multiple payment methods
- Order history
- Delivery status updates
- Estimated arrival times

### Driver App

- Real-time order notifications
- GPS tracking and navigation
- Order management system
- Distance calculations
- Earnings tracking
- Status updates (Available/Busy)

## Technical Stack

### Frontend

- React Native / Expo
- TypeScript
- React Query for data fetching
- Expo Location for GPS tracking
- Google Maps integration
- WebSocket for real-time updates

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- WebSocket for real-time communication
- JWT Authentication

## Key Components

### Location Tracking

The driver app implements continuous location tracking using Expo Location services to:

- Track driver position in real-time
- Update server with location changes
- Calculate distances to delivery locations
- Enable turn-by-turn navigation

### Distance Calculation

Uses the Haversine formula to calculate accurate distances between coordinates:

- Determines distance between driver and delivery location
- Helps match closest available driver to new orders
- Provides ETA calculations
- Shows distance information in the UI

### Order Matching

Smart driver matching algorithm that considers multiple factors:

- Distance to customer (40% weight)
- Current workload (20% weight)
- Driver rating (15% weight)
- Experience score (15% weight)
- Time since last order (10% weight)

### Real-time Updates

Both customer and driver apps receive real-time updates through WebSocket connections for:

- Order status changes
- Driver location updates
- New order notifications
- Delivery ETAs

## Installation

1. Clone the repository

2. Install dependencies:

```bash
# Install server dependencies
cd server
npm install

# Install driver app dependencies
cd ../driver
npm install

# Install customer app dependencies
cd ../client
npm install
```

3. Set up environment variables:

- Create `.env` files in server, driver, and client directories
- Add required API keys and configuration

4. Start the development servers:

```bash
# Start backend server
cd server
npm run dev

# Start driver app
cd ../driver
npm start

# Start customer app
cd ../client
npm start
```

## Environment Variables

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `GOOGLE_MAPS_API_KEY`: Google Maps API key
- `EXPO_PUBLIC_API_URL`: Backend API URL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
