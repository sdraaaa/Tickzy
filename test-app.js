/**
 * Simple test script to verify Tickzy application functionality
 * Run this in the browser console to test the app
 */

console.log('🧪 Starting Tickzy Application Tests...');

// Test 1: Check if the application is loaded
console.log('\n1. Application Load Test:');
if (typeof window !== 'undefined' && window.location) {
  console.log('   ✅ Application loaded successfully');
  console.log('   Current URL:', window.location.href);
} else {
  console.log('   ❌ Application not loaded properly');
}

// Test 2: Check if debug functions are available
console.log('\n2. Debug Functions Test:');
const debugFunctions = [
  'createSampleEvents',
  'debugAuthState',
  'clearAllAppState'
];

debugFunctions.forEach(func => {
  if (typeof window[func] === 'function') {
    console.log(`   ✅ ${func} is available`);
  } else {
    console.log(`   ❌ ${func} is not available`);
  }
});

// Test 3: Check Firebase connection
console.log('\n3. Firebase Connection Test:');
try {
  // This will be available if Firebase is loaded
  if (window.firebase || document.querySelector('[data-firebase]')) {
    console.log('   ✅ Firebase appears to be loaded');
  } else {
    console.log('   ⚠️ Firebase status unclear');
  }
} catch (error) {
  console.log('   ❌ Error checking Firebase:', error.message);
}

// Test 4: Check if events are loading
console.log('\n4. Events Loading Test:');
setTimeout(() => {
  const eventCards = document.querySelectorAll('[data-testid="event-card"], .event-card, [class*="event"]');
  if (eventCards.length > 0) {
    console.log(`   ✅ Found ${eventCards.length} event elements on page`);
  } else {
    console.log('   ⚠️ No event elements found - may need sample data');
    console.log('   💡 Try running: createSampleEvents()');
  }
}, 2000);

// Test 5: Check authentication state
console.log('\n5. Authentication Test:');
setTimeout(() => {
  const loginButton = document.querySelector('[href="/login"], button[class*="login"], a[class*="login"]');
  const userMenu = document.querySelector('[class*="user-menu"], [class*="profile"]');
  
  if (loginButton && !userMenu) {
    console.log('   ✅ User appears to be logged out (login button visible)');
  } else if (userMenu && !loginButton) {
    console.log('   ✅ User appears to be logged in (user menu visible)');
  } else {
    console.log('   ⚠️ Authentication state unclear');
  }
}, 1000);

console.log('\n🏁 Test script completed. Check results above.');
console.log('\n💡 Available commands:');
console.log('   - createSampleEvents() - Add sample events to database');
console.log('   - debugAuthState() - Check authentication status');
console.log('   - clearAllAppState() - Clear all app state');
console.log('   - debugNavigationState() - Check navigation state');
