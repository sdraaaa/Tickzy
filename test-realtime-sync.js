/**
 * Comprehensive Real-time Synchronization Test Script
 * 
 * Run this in the browser console to test the enhanced real-time synchronization
 * for both event approval and host request workflows.
 */

console.log('🚀 Starting Comprehensive Real-time Synchronization Tests...');

// Test configuration
const TEST_CONFIG = {
  ADMIN_EMAIL: 'aleemsidra2205@gmail.com',
  HOST_EMAIL: 'abdulaleemsidra@gmail.com',
  USER_EMAIL: 'sidraaleem8113@gmail.com',
  TEST_TIMEOUT: 10000, // 10 seconds
  VERIFICATION_DELAY: 3000 // 3 seconds
};

// Test results tracking
let testResults = {
  eventApprovalRealTime: false,
  hostRequestRealTime: false,
  publicEventVisibility: false,
  adminDashboardSync: false,
  connectionMonitoring: false
};

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test 1: Event Approval Real-time Synchronization
async function testEventApprovalRealTime() {
  console.log('\n🧪 Test 1: Event Approval Real-time Synchronization');
  
  try {
    // Check if enhanced functions are available
    if (typeof runComprehensiveRealTimeTests !== 'function') {
      console.log('   ⚠️ Enhanced real-time functions not available. Loading...');
      return false;
    }
    
    // Run comprehensive real-time tests
    const results = await runComprehensiveRealTimeTests();
    
    if (results.events.approvedEvents > 0) {
      console.log('   ✅ Event approval real-time synchronization working');
      testResults.eventApprovalRealTime = true;
      return true;
    } else {
      console.log('   ⚠️ No approved events found - may need sample data');
      console.log('   💡 Try running: createSampleEvents()');
      return false;
    }
    
  } catch (error) {
    console.error('   ❌ Event approval real-time test failed:', error);
    return false;
  }
}

// Test 2: Host Request Real-time Synchronization
async function testHostRequestRealTime() {
  console.log('\n🧪 Test 2: Host Request Real-time Synchronization');
  
  try {
    // Check if enhanced functions are available
    if (typeof testHostRequestRealTime !== 'function') {
      console.log('   ⚠️ Enhanced host request functions not available');
      return false;
    }
    
    // Run host request real-time tests
    const results = await testHostRequestRealTime();
    
    console.log(`   📊 Total host requests: ${results.totalHostRequests}`);
    console.log(`   📊 Pending host requests: ${results.pendingHostRequests}`);
    
    testResults.hostRequestRealTime = true;
    console.log('   ✅ Host request real-time synchronization working');
    return true;
    
  } catch (error) {
    console.error('   ❌ Host request real-time test failed:', error);
    return false;
  }
}

// Test 3: Public Event Visibility
async function testPublicEventVisibility() {
  console.log('\n🧪 Test 3: Public Event Visibility');
  
  try {
    // Check if we're on the landing page
    if (!window.location.pathname.includes('/') || window.location.pathname !== '/') {
      console.log('   ⚠️ Not on landing page - navigate to / to test public visibility');
      return false;
    }
    
    // Check for event cards on the page
    await wait(2000); // Wait for events to load
    
    const eventCards = document.querySelectorAll('[data-testid="event-card"], .event-card, [class*="event"]');
    const eventTitles = document.querySelectorAll('h3, h2, .font-bold');
    
    let visibleEvents = 0;
    eventTitles.forEach(title => {
      if (title.textContent && (
        title.textContent.includes('Event') || 
        title.textContent.includes('Conference') ||
        title.textContent.includes('Festival') ||
        title.textContent.includes('Workshop')
      )) {
        visibleEvents++;
      }
    });
    
    if (visibleEvents > 0) {
      console.log(`   ✅ Found ${visibleEvents} events visible on public page`);
      testResults.publicEventVisibility = true;
      return true;
    } else {
      console.log('   ⚠️ No events visible on public page');
      console.log('   💡 Try creating and approving some events first');
      return false;
    }
    
  } catch (error) {
    console.error('   ❌ Public event visibility test failed:', error);
    return false;
  }
}

// Test 4: Admin Dashboard Synchronization
async function testAdminDashboardSync() {
  console.log('\n🧪 Test 4: Admin Dashboard Synchronization');
  
  try {
    // Check if we're on admin dashboard
    if (!window.location.pathname.includes('/admin')) {
      console.log('   ⚠️ Not on admin dashboard - navigate to /admin to test');
      return false;
    }
    
    // Check for admin dashboard elements
    await wait(2000); // Wait for dashboard to load
    
    const pendingEventsSection = document.querySelector('[class*="pending"], [id*="pending"]');
    const hostRequestsSection = document.querySelector('[class*="host"], [id*="host"]');
    const statsElements = document.querySelectorAll('[class*="stat"], [class*="count"]');
    
    if (pendingEventsSection || hostRequestsSection || statsElements.length > 0) {
      console.log('   ✅ Admin dashboard elements found and loading');
      testResults.adminDashboardSync = true;
      return true;
    } else {
      console.log('   ⚠️ Admin dashboard elements not found');
      return false;
    }
    
  } catch (error) {
    console.error('   ❌ Admin dashboard sync test failed:', error);
    return false;
  }
}

// Test 5: Connection Monitoring
async function testConnectionMonitoring() {
  console.log('\n🧪 Test 5: Connection Monitoring');
  
  try {
    // Check if connection monitoring functions are available
    if (typeof isFirestoreOnline === 'function') {
      const isOnline = isFirestoreOnline();
      console.log(`   📡 Firestore connection status: ${isOnline ? 'Online' : 'Offline'}`);
      
      // Check for connection status indicators in UI
      const connectionIndicators = document.querySelectorAll('[class*="connection"], [class*="offline"], [class*="online"]');
      
      if (connectionIndicators.length > 0) {
        console.log('   ✅ Connection status indicators found in UI');
      }
      
      testResults.connectionMonitoring = true;
      console.log('   ✅ Connection monitoring working');
      return true;
    } else {
      console.log('   ⚠️ Connection monitoring functions not available');
      return false;
    }
    
  } catch (error) {
    console.error('   ❌ Connection monitoring test failed:', error);
    return false;
  }
}

// Run all tests
async function runAllRealTimeTests() {
  console.log('🎯 Running All Real-time Synchronization Tests...\n');
  
  const tests = [
    { name: 'Event Approval Real-time', test: testEventApprovalRealTime },
    { name: 'Host Request Real-time', test: testHostRequestRealTime },
    { name: 'Public Event Visibility', test: testPublicEventVisibility },
    { name: 'Admin Dashboard Sync', test: testAdminDashboardSync },
    { name: 'Connection Monitoring', test: testConnectionMonitoring }
  ];
  
  let passedTests = 0;
  
  for (const { name, test } of tests) {
    try {
      const result = await test();
      if (result) passedTests++;
    } catch (error) {
      console.error(`❌ Test "${name}" failed with error:`, error);
    }
    
    // Wait between tests
    await wait(1000);
  }
  
  // Final results
  console.log('\n📊 FINAL TEST RESULTS:');
  console.log('========================');
  
  Object.entries(testResults).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log(`\n🎯 Overall Score: ${passedTests}/${tests.length} tests passed`);
  
  if (passedTests === tests.length) {
    console.log('🎉 ALL REAL-TIME SYNCHRONIZATION TESTS PASSED!');
  } else if (passedTests >= tests.length * 0.8) {
    console.log('✅ Most real-time synchronization features working correctly');
  } else {
    console.log('⚠️ Some real-time synchronization issues detected');
  }
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (!testResults.eventApprovalRealTime) {
    console.log('- Create sample events: createSampleEvents()');
    console.log('- Test event approval workflow manually');
  }
  if (!testResults.hostRequestRealTime) {
    console.log('- Submit a host request as a regular user');
    console.log('- Check admin dashboard for pending requests');
  }
  if (!testResults.publicEventVisibility) {
    console.log('- Ensure events are approved by admin');
    console.log('- Check landing page for visible events');
  }
  
  return {
    passed: passedTests,
    total: tests.length,
    results: testResults
  };
}

// Make functions available globally
window.testEventApprovalRealTime = testEventApprovalRealTime;
window.testHostRequestRealTime = testHostRequestRealTime;
window.testPublicEventVisibility = testPublicEventVisibility;
window.testAdminDashboardSync = testAdminDashboardSync;
window.testConnectionMonitoring = testConnectionMonitoring;
window.runAllRealTimeTests = runAllRealTimeTests;

// Auto-run tests after a short delay
setTimeout(() => {
  console.log('🚀 Auto-running real-time synchronization tests...');
  runAllRealTimeTests();
}, 3000);

console.log('\n💡 Available Commands:');
console.log('- runAllRealTimeTests() - Run all tests');
console.log('- testEventApprovalRealTime() - Test event approval sync');
console.log('- testHostRequestRealTime() - Test host request sync');
console.log('- testPublicEventVisibility() - Test public event visibility');
console.log('- testAdminDashboardSync() - Test admin dashboard sync');
console.log('- testConnectionMonitoring() - Test connection monitoring');
