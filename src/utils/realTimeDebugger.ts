/**
 * Real-time Synchronization Debugger
 * 
 * Comprehensive debugging and testing utilities for Firebase real-time synchronization issues
 */

import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/firebase';

// Test event approval real-time synchronization
export const testEventApprovalRealTime = async () => {
  console.log('🧪 Testing Event Approval Real-time Synchronization...');
  
  try {
    // 1. Test public events subscription (approved only)
    console.log('\n1. Testing public events subscription (approved only)...');
    const publicEventsQuery = query(
      collection(db, 'events'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    
    let publicEventCount = 0;
    const unsubscribePublic = onSnapshot(publicEventsQuery, (snapshot) => {
      publicEventCount = snapshot.size;
      console.log(`   📊 Public events (approved): ${publicEventCount}`);
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   ✅ Event: ${data.title} (Status: ${data.status})`);
      });
    }, (error) => {
      console.error('   ❌ Error in public events subscription:', error);
    });

    // 2. Test admin events subscription (all events)
    console.log('\n2. Testing admin events subscription (all events)...');
    const adminEventsQuery = query(
      collection(db, 'events'),
      orderBy('createdAt', 'desc')
    );
    
    let adminEventCount = 0;
    const unsubscribeAdmin = onSnapshot(adminEventsQuery, (snapshot) => {
      adminEventCount = snapshot.size;
      console.log(`   📊 Admin events (all): ${adminEventCount}`);
      const statusCounts = { pending: 0, approved: 0, rejected: 0, cancelled: 0 };
      snapshot.forEach((doc) => {
        const data = doc.data();
        const status = data.status || 'pending';
        statusCounts[status as keyof typeof statusCounts]++;
      });
      console.log(`   📈 Status breakdown:`, statusCounts);
    }, (error) => {
      console.error('   ❌ Error in admin events subscription:', error);
    });

    // 3. Test pending events subscription
    console.log('\n3. Testing pending events subscription...');
    const pendingEventsQuery = query(
      collection(db, 'events'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    let pendingEventCount = 0;
    const unsubscribePending = onSnapshot(pendingEventsQuery, (snapshot) => {
      pendingEventCount = snapshot.size;
      console.log(`   📊 Pending events: ${pendingEventCount}`);
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   ⏳ Pending: ${data.title} (Created: ${data.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'})`);
      });
    }, (error) => {
      console.error('   ❌ Error in pending events subscription:', error);
    });

    // Wait for initial data load
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n📋 Summary:');
    console.log(`   Total events (admin view): ${adminEventCount}`);
    console.log(`   Approved events (public view): ${publicEventCount}`);
    console.log(`   Pending events: ${pendingEventCount}`);

    // Cleanup subscriptions
    unsubscribePublic();
    unsubscribeAdmin();
    unsubscribePending();

    return {
      totalEvents: adminEventCount,
      approvedEvents: publicEventCount,
      pendingEvents: pendingEventCount
    };

  } catch (error) {
    console.error('❌ Error testing event approval real-time:', error);
    throw error;
  }
};

// Test host request real-time synchronization
export const testHostRequestRealTime = async () => {
  console.log('🧪 Testing Host Request Real-time Synchronization...');
  
  try {
    // 1. Test pending host requests subscription
    console.log('\n1. Testing pending host requests subscription...');
    const pendingHostQuery = query(
      collection(db, 'users'),
      where('hostStatus', '==', 'pending')
    );
    
    let pendingHostCount = 0;
    const unsubscribePendingHosts = onSnapshot(pendingHostQuery, (snapshot) => {
      pendingHostCount = snapshot.size;
      console.log(`   📊 Pending host requests: ${pendingHostCount}`);
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`   ⏳ Request: ${data.displayName || data.email} (Date: ${data.hostRequestDate?.toDate?.()?.toLocaleString() || 'Unknown'})`);
        console.log(`   💬 Message: ${data.hostRequestMessage || 'No message'}`);
      });
    }, (error) => {
      console.error('   ❌ Error in pending host requests subscription:', error);
    });

    // 2. Test all host requests subscription
    console.log('\n2. Testing all host requests subscription...');
    const allHostQuery = query(
      collection(db, 'users'),
      where('hostStatus', 'in', ['pending', 'approved', 'rejected'])
    );
    
    let allHostCount = 0;
    const unsubscribeAllHosts = onSnapshot(allHostQuery, (snapshot) => {
      allHostCount = snapshot.size;
      console.log(`   📊 All host requests: ${allHostCount}`);
      const statusCounts = { pending: 0, approved: 0, rejected: 0 };
      snapshot.forEach((doc) => {
        const data = doc.data();
        const status = data.hostStatus || 'none';
        if (status !== 'none') {
          statusCounts[status as keyof typeof statusCounts]++;
        }
      });
      console.log(`   📈 Status breakdown:`, statusCounts);
    }, (error) => {
      console.error('   ❌ Error in all host requests subscription:', error);
    });

    // Wait for initial data load
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('\n📋 Summary:');
    console.log(`   Total host requests: ${allHostCount}`);
    console.log(`   Pending host requests: ${pendingHostCount}`);

    // Cleanup subscriptions
    unsubscribePendingHosts();
    unsubscribeAllHosts();

    return {
      totalHostRequests: allHostCount,
      pendingHostRequests: pendingHostCount
    };

  } catch (error) {
    console.error('❌ Error testing host request real-time:', error);
    throw error;
  }
};

// Test a complete approval workflow
export const testApprovalWorkflow = async (eventId: string, adminId: string) => {
  console.log(`🧪 Testing approval workflow for event ${eventId}...`);
  
  try {
    // 1. Get initial event state
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }
    
    const initialData = eventDoc.data();
    console.log(`   📋 Initial status: ${initialData.status || 'pending'}`);

    // 2. Set up real-time listeners to track changes
    let publicEventVisible = false;
    let adminEventUpdated = false;

    // Public events listener
    const publicQuery = query(
      collection(db, 'events'),
      where('status', '==', 'approved')
    );
    
    const unsubscribePublic = onSnapshot(publicQuery, (snapshot) => {
      const foundEvent = snapshot.docs.find(doc => doc.id === eventId);
      if (foundEvent) {
        publicEventVisible = true;
        console.log(`   ✅ Event now visible in public view`);
      }
    });

    // Admin events listener
    const unsubscribeAdmin = onSnapshot(doc(db, 'events', eventId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.status === 'approved') {
          adminEventUpdated = true;
          console.log(`   ✅ Event status updated in admin view`);
        }
      }
    });

    // 3. Approve the event
    console.log(`   🔄 Approving event...`);
    await updateDoc(doc(db, 'events', eventId), {
      status: 'approved',
      statusUpdatedAt: serverTimestamp(),
      statusUpdatedBy: adminId
    });

    // 4. Wait for real-time updates
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Check results
    console.log('\n📋 Workflow Results:');
    console.log(`   Admin view updated: ${adminEventUpdated ? '✅' : '❌'}`);
    console.log(`   Public view updated: ${publicEventVisible ? '✅' : '❌'}`);

    // Cleanup
    unsubscribePublic();
    unsubscribeAdmin();

    return {
      adminUpdated: adminEventUpdated,
      publicUpdated: publicEventVisible
    };

  } catch (error) {
    console.error('❌ Error testing approval workflow:', error);
    throw error;
  }
};

// Check Firestore indexes
export const checkFirestoreIndexes = async () => {
  console.log('🧪 Checking Firestore indexes...');
  
  try {
    // Test queries that require indexes
    const testQueries = [
      {
        name: 'Events by status and createdAt',
        query: query(
          collection(db, 'events'),
          where('status', '==', 'approved'),
          orderBy('createdAt', 'desc')
        )
      },
      {
        name: 'Events by status and category',
        query: query(
          collection(db, 'events'),
          where('status', '==', 'approved'),
          where('category', '==', 'Technology')
        )
      },
      {
        name: 'Users by hostStatus',
        query: query(
          collection(db, 'users'),
          where('hostStatus', '==', 'pending')
        )
      }
    ];

    for (const test of testQueries) {
      try {
        console.log(`   Testing: ${test.name}...`);
        const snapshot = await getDocs(test.query);
        console.log(`   ✅ ${test.name}: ${snapshot.size} documents`);
      } catch (error: any) {
        if (error.code === 'failed-precondition') {
          console.log(`   ❌ ${test.name}: Missing index`);
          console.log(`   💡 Create index: ${error.message}`);
        } else {
          console.log(`   ⚠️ ${test.name}: ${error.message}`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error checking indexes:', error);
  }
};

// Run comprehensive real-time tests
export const runComprehensiveRealTimeTests = async () => {
  console.log('🚀 Running Comprehensive Real-time Synchronization Tests...');
  
  try {
    // 1. Check indexes
    await checkFirestoreIndexes();
    
    // 2. Test event approval real-time
    const eventResults = await testEventApprovalRealTime();
    
    // 3. Test host request real-time
    const hostResults = await testHostRequestRealTime();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📊 Final Results:');
    console.log('Events:', eventResults);
    console.log('Host Requests:', hostResults);
    
    return {
      events: eventResults,
      hostRequests: hostResults
    };
    
  } catch (error) {
    console.error('❌ Comprehensive tests failed:', error);
    throw error;
  }
};

// Make functions available in browser console
if (typeof window !== 'undefined') {
  (window as any).testEventApprovalRealTime = testEventApprovalRealTime;
  (window as any).testHostRequestRealTime = testHostRequestRealTime;
  (window as any).testApprovalWorkflow = testApprovalWorkflow;
  (window as any).checkFirestoreIndexes = checkFirestoreIndexes;
  (window as any).runComprehensiveRealTimeTests = runComprehensiveRealTimeTests;
}
