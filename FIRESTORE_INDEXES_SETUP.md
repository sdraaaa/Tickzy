# Firestore Indexes Automated Setup Guide

This guide explains how to automatically create the required Firestore composite indexes for the Tickzy application using the automated deployment system.

## 🎯 Overview

The Tickzy application requires specific Firestore composite indexes for optimal query performance. Instead of manually creating these indexes through the Firebase Console, we've implemented an automated solution that:

- ✅ **Programmatically creates indexes** using Firebase CLI
- ✅ **Appears in Firebase Console** after deployment
- ✅ **Handles error detection** and provides clear instructions
- ✅ **Includes fallback mechanisms** for failed deployments
- ✅ **Provides real-time status monitoring**

## 📋 Required Indexes

The application requires these composite indexes:

### 1. Events by Status and Creation Date
- **Collection**: `events`
- **Fields**: `status` (ascending), `createdAt` (descending)
- **Usage**: Public event listings, filtered by approval status

### 2. Events by Status, Category and Creation Date
- **Collection**: `events`
- **Fields**: `status` (ascending), `category` (ascending), `createdAt` (descending)
- **Usage**: Category-filtered event listings

### 3. Events by Creator and Creation Date
- **Collection**: `events`
- **Fields**: `createdBy` (ascending), `createdAt` (descending)
- **Usage**: Host dashboard event listings

### 4. Events by Rating and Creation Date
- **Collection**: `events`
- **Fields**: `rating` (descending), `createdAt` (descending)
- **Usage**: Popular events section

## 🚀 Automated Deployment

### Prerequisites

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Authenticate with Firebase**:
   ```bash
   npm run firebase:login
   ```

### Quick Setup (Recommended)

Run the automated setup script:

```bash
npm run setup:firebase
```

This command will:
- Authenticate with Firebase (if needed)
- Deploy all required indexes
- Provide status updates
- Show Firebase Console links

### Manual Deployment Options

#### Option 1: Deploy All Indexes
```bash
npm run deploy:firestore
```

#### Option 2: Deploy Only Indexes (not rules)
```bash
npm run deploy:firestore:indexes
```

#### Option 3: Deploy Everything (indexes + rules)
```bash
npm run deploy:firestore:all
```

### Verification Commands

Check deployment status:
```bash
# List current indexes
npm run firebase:indexes:status

# View Firebase projects
npm run firebase:projects
```

## 🔍 Real-Time Monitoring

The application includes built-in index monitoring:

### Automatic Detection
- **On startup**: Checks all required indexes
- **Error handling**: Detects missing indexes from query errors
- **User guidance**: Provides deployment instructions in console

### Admin Dashboard
- Navigate to Admin Dashboard → Firestore Index Status
- View real-time index availability
- Get deployment instructions
- Monitor index creation progress

### Console Monitoring
Check browser console for:
```
✅ Index available: Events filtered by status and ordered by creation date
❌ Index missing: Events filtered by creator and ordered by creation date
```

## 📁 Configuration Files

### firestore.indexes.json
Contains all index definitions:
```json
{
  "indexes": [
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
    // ... more indexes
  ]
}
```

### package.json Scripts
New deployment commands:
- `npm run deploy:firestore` - Automated deployment script
- `npm run deploy:firestore:indexes` - Deploy indexes only
- `npm run deploy:firestore:rules` - Deploy rules only
- `npm run deploy:firestore:all` - Deploy both indexes and rules
- `npm run setup:firebase` - Complete Firebase setup

## ⚠️ Troubleshooting

### Common Issues

#### 1. Firebase CLI Not Installed
```bash
Error: firebase command not found
```
**Solution**: Install Firebase CLI globally
```bash
npm install -g firebase-tools
```

#### 2. Authentication Required
```bash
Error: Authentication required
```
**Solution**: Login to Firebase
```bash
npm run firebase:login
```

#### 3. Project Not Found
```bash
Error: Project tickzy-e986b not found
```
**Solution**: Verify project access and authentication
```bash
npm run firebase:projects
```

#### 4. Index Creation Timeout
**Symptoms**: Indexes show as "Building" for extended periods
**Solution**: 
- Wait 5-10 minutes for large datasets
- Check Firebase Console for progress
- Indexes are usable once status shows "Enabled"

### Fallback Options

If automated deployment fails:

#### Manual Console Creation
1. Open Firebase Console: https://console.firebase.google.com/project/tickzy-e986b/firestore/indexes
2. Click "Create Index"
3. Use the index definitions from `firestore.indexes.json`

#### Local Firebase Emulator
For development/testing:
```bash
firebase emulators:start --only firestore
```

## 🔗 Monitoring Links

- **Firebase Console**: https://console.firebase.google.com/project/tickzy-e986b/firestore/indexes
- **Index Status**: Admin Dashboard → Firestore Index Status
- **Query Performance**: Firebase Console → Firestore → Usage tab

## ✅ Success Indicators

After successful deployment:

1. **Console Output**:
   ```
   ✅ Firestore indexes deployed successfully!
   ✅ All required Firestore indexes are available!
   ```

2. **Firebase Console**: All indexes show "Enabled" status

3. **Application**: No index-related errors in browser console

4. **Query Performance**: Fast loading of event listings and dashboards

## 🔄 Maintenance

### Regular Checks
- Monitor index usage in Firebase Console
- Update `firestore.indexes.json` when adding new queries
- Re-deploy indexes after schema changes

### Performance Optimization
- Review query patterns quarterly
- Remove unused indexes to reduce storage costs
- Monitor read/write quotas in Firebase Console

---

## 📞 Support

If you encounter issues with index deployment:

1. Check the troubleshooting section above
2. Review Firebase Console error messages
3. Verify authentication and project permissions
4. Contact the development team with specific error messages
