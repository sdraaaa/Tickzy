# Tickzy Authentication Testing Guide

## 🎯 Overview
This guide provides comprehensive testing instructions for the Tickzy authentication system to ensure consistent behavior across all environments and devices.

## 🔧 Pre-configured User Accounts

### 1. Regular User Account
- **Email**: `sidraaleem8113@gmail.com`
- **Role**: `user`
- **Display Name**: `Sidra Aleem`
- **Redirect Target**: `/user-dashboard`

### 2. Host/Event Manager Account
- **Email**: `abdulaleemsidra@gmail.com`
- **Role**: `host`
- **Display Name**: `Abdul Aleem Sidra`
- **Redirect Target**: `/host-dashboard`

### 3. Admin Account
- **Email**: `aleemsidra2205@gmail.com`
- **Role**: `admin`
- **Display Name**: `Aleem Sidra`
- **Redirect Target**: `/admin`

### 4. Default Behavior
- **Any other Gmail account**: Automatically receives `user` role and redirects to `/user-dashboard`

## 🧪 Testing Procedures

### Step 1: Initial Setup
1. Open the application at `http://localhost:5173/`
2. Verify you see the **Role Manager** panel (top-left) and **Debug Auth** panel (bottom-right)
3. Click **"Setup Predefined Users"** in the Role Manager panel
4. Verify success message: "Predefined users have been set up successfully!"

### Step 2: Test Authentication State Clearing
1. Click **"Debug Storage"** in the Debug Auth panel
2. Check browser console for authentication state information
3. Click **"Force Logout"** to clear all authentication data
4. Verify page reloads and shows landing page
5. Confirm Debug Auth panel shows:
   - Loading: false
   - Current User: null
   - User Data: null

### Step 3: Test Public Landing Page Access
1. **Fresh Browser Session**: Open incognito/private window
2. Navigate to `http://localhost:5173/`
3. **Expected Result**: Should show public landing page with events
4. **Verify**: No automatic redirect to any dashboard
5. **Test Event Browsing**: Should work without authentication prompts
6. **Test Booking**: Click "Book Ticket" → Should show login alert

### Step 4: Test Role-Based Authentication

#### Test User Account (sidraaleem8113@gmail.com)
1. Go to `/login` or `/register`
2. Click "Continue with Google"
3. Sign in with `sidraaleem8113@gmail.com`
4. **Expected Result**: Redirect to `/user-dashboard`
5. **Verify Debug Panel**: Should show Role: user

#### Test Host Account (abdulaleemsidra@gmail.com)
1. Clear authentication state (Force Logout)
2. Sign in with `abdulaleemsidra@gmail.com`
3. **Expected Result**: Redirect to `/host-dashboard`
4. **Verify Debug Panel**: Should show Role: host

#### Test Admin Account (aleemsidra2205@gmail.com)
1. Clear authentication state (Force Logout)
2. Sign in with `aleemsidra2205@gmail.com`
3. **Expected Result**: Redirect to `/admin`
4. **Verify Debug Panel**: Should show Role: admin

#### Test Unknown Gmail Account
1. Clear authentication state (Force Logout)
2. Sign in with any other Gmail account
3. **Expected Result**: Redirect to `/user-dashboard`
4. **Verify Debug Panel**: Should show Role: user

### Step 5: Test Cross-Environment Consistency

#### Test in Different Browsers
1. **Chrome**: Complete full authentication flow
2. **Firefox**: Complete full authentication flow
3. **Edge**: Complete full authentication flow
4. **Safari** (if available): Complete full authentication flow

#### Test in Incognito/Private Mode
1. Open incognito window in each browser
2. Verify landing page shows without authentication
3. Test one complete authentication flow
4. Verify proper role-based redirect

#### Test Authentication Persistence
1. Sign in with any account
2. Close browser completely
3. Reopen browser and navigate to `http://localhost:5173/`
4. **Expected**: Should redirect to appropriate dashboard (persistence working)
5. Use "Force Logout" to clear state
6. **Expected**: Should show landing page (clearing working)

## 🔍 Debug Tools Available

### Role Manager Panel (Top-Left)
- **Setup Predefined Users**: Creates all three accounts in Firestore
- **Test User Role**: Enter email to check assigned role
- **All Users**: View all configured users
- **Quick Test Buttons**: Test each account type instantly

### Debug Auth Panel (Bottom-Right)
- **Real-time Auth State**: Shows current user and role
- **Logout**: Standard Firebase logout
- **Force Logout**: Comprehensive authentication clearing
- **Clear Auth Data**: Remove Firebase-specific storage
- **Clear All Storage**: Remove all localStorage/sessionStorage
- **Debug Storage**: Log all storage contents to console

## ✅ Expected Results Summary

### Unauthenticated Users
- ✅ Landing page displays at `/`
- ✅ Can browse events without login prompts
- ✅ Login prompt only appears when booking tickets
- ✅ No automatic redirects to dashboards

### Authenticated Users
- ✅ Automatic redirect from landing page to appropriate dashboard
- ✅ Role-based routing works correctly:
  - `user` → `/user-dashboard`
  - `host` → `/host-dashboard`
  - `admin` → `/admin`
- ✅ Authentication state persists across browser sessions
- ✅ Force logout completely clears authentication state

### Security Features
- ✅ Debug tools only visible in development environment
- ✅ Role assignments stored securely in Firestore
- ✅ No sensitive information exposed in production builds
- ✅ Proper authentication state management

## 🚨 Troubleshooting

### Issue: Automatic redirect to dashboard when unauthenticated
**Solution**: Use "Force Logout" button to clear all authentication state

### Issue: Wrong role assignment
**Solution**: Use Role Manager to re-setup predefined users

### Issue: Authentication state not clearing
**Solution**: Use "Clear All Storage" button and refresh page

### Issue: Debug panels not visible
**Check**: Ensure you're in development environment on localhost

## 🔒 Production Considerations

- Debug components automatically hidden in production
- Role assignments secured in Firestore
- Comprehensive authentication state clearing available
- Cross-browser compatibility ensured
- Proper error handling implemented
