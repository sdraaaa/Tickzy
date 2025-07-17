# Firebase Deployment Guide

This guide explains how to deploy the Firestore security rules and indexes for the Tickzy application.

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Authenticated with Firebase: `firebase login`
3. Firebase project initialized in this directory

## Files Overview

- `firestore.rules` - Security rules for Firestore database
- `firestore.indexes.json` - Composite indexes for efficient querying

## Deployment Steps

### 1. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### 2. Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

### 3. Deploy Both (Recommended)

```bash
firebase deploy --only firestore
```

## Security Rules Summary

### Users Collection (`/users/{userId}`)
- **Read**: Users can read their own data, admins can read all
- **Create**: Users can create their own profile during signup
- **Update**: Users can update their own profile, admins can update any
- **Delete**: Only admins can delete users

### Events Collection (`/events/{eventId}`)
- **Read**: Public access (anyone can browse events)
- **Create**: Only approved hosts can create events
- **Update**: Only event creator or admin can update
- **Delete**: Only event creator or admin can delete

### Bookings Collection (`/bookings/{bookingId}`)
- **Read**: Users see their bookings, hosts see bookings for their events, admins see all
- **Create**: Only authenticated users can create bookings for themselves
- **Update**: Booking owner, event host, or admin can update
- **Delete**: Booking owner, event host, or admin can delete

## Index Configurations

### Events Indexes
1. `category + createdAt (desc)` - For category filtering with recent events first
2. `rating (desc) + createdAt (desc)` - For popular events queries
3. `createdBy + createdAt (desc)` - For host's event management

### Users Indexes
1. `hostStatus + hostRequestDate (desc)` - For admin host request management
2. `role + hostRequestDate (desc)` - For role-based queries with request dates

### Bookings Indexes
1. `userId + createdAt (desc)` - For user's booking history
2. `hostId + createdAt (desc)` - For host's booking management
3. `eventId + createdAt (desc)` - For event-specific bookings

## Testing Security Rules

After deployment, test the rules with different user roles:

1. **Unauthenticated users**: Should be able to read events only
2. **Regular users**: Should be able to read events, manage their profile and bookings
3. **Approved hosts**: Should be able to create/manage events in addition to user permissions
4. **Admins**: Should have full access to all collections

## Monitoring

Monitor rule performance and usage in the Firebase Console:
- Go to Firestore → Rules tab to see rule evaluation metrics
- Go to Firestore → Indexes tab to monitor index usage

## Troubleshooting

### Common Issues

1. **Permission denied errors**: Check if user has correct role and hostStatus
2. **Index not found errors**: Ensure indexes are deployed and built
3. **Rule evaluation timeout**: Optimize complex rule conditions

### Debug Commands

```bash
# Test rules locally
firebase emulators:start --only firestore

# View current rules
firebase firestore:rules:get

# View current indexes
firebase firestore:indexes
```

## Security Best Practices

1. **Principle of least privilege**: Users only get minimum required permissions
2. **Data validation**: Rules validate data structure and required fields
3. **Authentication checks**: All write operations require authentication
4. **Role-based access**: Different permissions for users, hosts, and admins
5. **Resource ownership**: Users can only modify their own resources (except admins)

## Performance Optimization

1. **Composite indexes**: Created for all complex queries
2. **Query limitations**: Rules designed to work with indexed queries
3. **Efficient rule evaluation**: Helper functions reduce redundant checks
4. **Minimal data reads**: Rules avoid unnecessary document reads where possible
