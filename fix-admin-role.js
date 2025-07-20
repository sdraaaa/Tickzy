// Quick fix script for admin role issue
// Run this in the browser console on your admin dashboard

(async function fixAdminRole() {
  console.log('🔧 Starting admin role fix...');
  
  try {
    // Get current user from Firebase Auth
    const auth = window.firebase?.auth?.() || window.auth;
    if (!auth) {
      console.error('❌ Firebase Auth not found');
      return;
    }
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ No authenticated user');
      return;
    }
    
    console.log('✅ Current user:', {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName
    });
    
    // Check if this is the admin email
    if (currentUser.email !== 'aleemsidra2205@gmail.com') {
      console.error('❌ Not the admin email');
      return;
    }
    
    // Get Firestore instance
    const db = window.firebase?.firestore?.() || window.db;
    if (!db) {
      console.error('❌ Firestore not found');
      return;
    }
    
    console.log('🔍 Checking current user document...');
    
    // Check current user document
    const userDocRef = db.doc(`users/${currentUser.uid}`);
    const userDoc = await userDocRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      console.log('📄 Current user document:', userData);
      
      if (userData.role === 'admin') {
        console.log('✅ Admin role is already correct!');
        return;
      }
    }
    
    console.log('🔧 Creating/updating admin user document...');
    
    // Create/update the user document with admin role
    await userDocRef.set({
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName || 'Admin User',
      photoURL: currentUser.photoURL,
      role: 'admin',
      isPreConfigured: true,
      createdAt: userDoc.exists ? userDoc.data().createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log('✅ Admin user document created/updated successfully!');
    
    // Verify the document
    const verifyDoc = await userDocRef.get();
    if (verifyDoc.exists()) {
      console.log('✅ Verification successful:', verifyDoc.data());
      console.log('🎉 Admin role fix complete! Please refresh the page and try approving an event.');
    } else {
      console.error('❌ Verification failed: Document not found');
    }
    
  } catch (error) {
    console.error('❌ Error fixing admin role:', error);
  }
})();
