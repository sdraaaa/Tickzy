/**
 * Firestore Operation Monitor
 *
 * This utility monitors and logs all Firestore write operations to detect
 * unauthorized role modifications during event viewing.
 */

import { doc, getDoc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/firebase';

// Allowlist for legitimate role modifications
let roleModificationAllowed = false;
const allowedOperations = new Set<string>();

// Track all Firestore operations
const firestoreOperations: Array<{
  operation: string;
  collection: string;
  docId?: string;
  data?: any;
  timestamp: string;
  stackTrace: string;
  url: string;
  userAgent: string;
}> = [];

/**
 * Log a Firestore operation with context
 */
const logFirestoreOperation = (
  operation: string,
  collection: string,
  docId?: string,
  data?: any
) => {
  const logEntry = {
    operation,
    collection,
    docId,
    data: data ? JSON.parse(JSON.stringify(data)) : undefined,
    timestamp: new Date().toISOString(),
    stackTrace: new Error().stack || 'No stack trace available',
    url: window.location.href,
    userAgent: navigator.userAgent,
  };
  
  firestoreOperations.push(logEntry);
  
  // Log to console with appropriate severity
  if (operation.includes('write') || operation.includes('set') || operation.includes('update')) {
    if (collection === 'users' && data?.role) {
      console.error('🚨 CRITICAL: User role modification detected!', logEntry);
    } else {
      console.warn('⚠️ Firestore write operation:', logEntry);
    }
  } else {
    console.log('📖 Firestore read operation:', logEntry);
  }
};

/**
 * Wrapped Firestore functions with monitoring
 */

// Monitor getDoc operations
export const monitoredGetDoc = async (docRef: any) => {
  const collection = docRef.path.split('/')[0];
  const docId = docRef.path.split('/')[1];
  
  logFirestoreOperation('getDoc (read)', collection, docId);
  
  try {
    const result = await getDoc(docRef);
    logFirestoreOperation('getDoc (read) - success', collection, docId, result.exists() ? 'Document exists' : 'Document not found');
    return result;
  } catch (error) {
    logFirestoreOperation('getDoc (read) - error', collection, docId, error);
    throw error;
  }
};

// Monitor setDoc operations
export const monitoredSetDoc = async (docRef: any, data: any, options?: any) => {
  const collection = docRef.path.split('/')[0];
  const docId = docRef.path.split('/')[1];
  
  // CRITICAL: Check for user role modifications
  if (collection === 'users' && data.role) {
    if (!isRoleModificationAllowed()) {
      console.error('🚨 CRITICAL ALERT: Unauthorized role modification attempt blocked!', {
        collection,
        docId,
        newRole: data.role,
        data,
        options,
        stackTrace: new Error().stack,
        url: window.location.href,
        allowedOperations: Array.from(allowedOperations),
      });

      // ALWAYS throw an error to prevent unauthorized role changes
      throw new Error(`UNAUTHORIZED ROLE MODIFICATION BLOCKED: Attempted to set role '${data.role}' for user ${docId}. This operation is not allowed during event viewing or navigation. Use allowRoleModification() for legitimate operations.`);
    } else {
      console.log(`✅ Authorized role modification: Setting role '${data.role}' for user ${docId}`);
    }
  }
  
  logFirestoreOperation('setDoc (write)', collection, docId, { data, options });
  
  try {
    const result = await setDoc(docRef, data, options);
    logFirestoreOperation('setDoc (write) - success', collection, docId, { data, options });
    return result;
  } catch (error) {
    logFirestoreOperation('setDoc (write) - error', collection, docId, error);
    throw error;
  }
};

// Monitor updateDoc operations
export const monitoredUpdateDoc = async (docRef: any, data: any) => {
  const collection = docRef.path.split('/')[0];
  const docId = docRef.path.split('/')[1];
  
  // CRITICAL: Check for user role modifications
  if (collection === 'users' && data.role) {
    if (!isRoleModificationAllowed()) {
      console.error('🚨 CRITICAL ALERT: Unauthorized role update attempt blocked!', {
        collection,
        docId,
        newRole: data.role,
        data,
        stackTrace: new Error().stack,
        url: window.location.href,
        allowedOperations: Array.from(allowedOperations),
      });

      // ALWAYS throw an error to prevent unauthorized role changes
      throw new Error(`UNAUTHORIZED ROLE MODIFICATION BLOCKED: Attempted to update role '${data.role}' for user ${docId}. This operation is not allowed during event viewing or navigation. Use allowRoleModification() for legitimate operations.`);
    } else {
      console.log(`✅ Authorized role update: Setting role '${data.role}' for user ${docId}`);
    }
  }
  
  logFirestoreOperation('updateDoc (write)', collection, docId, data);
  
  try {
    const result = await updateDoc(docRef, data);
    logFirestoreOperation('updateDoc (write) - success', collection, docId, data);
    return result;
  } catch (error) {
    logFirestoreOperation('updateDoc (write) - error', collection, docId, error);
    throw error;
  }
};

// Monitor addDoc operations
export const monitoredAddDoc = async (collectionRef: any, data: any) => {
  const collection = collectionRef.path;
  
  logFirestoreOperation('addDoc (write)', collection, 'new-document', data);
  
  try {
    const result = await addDoc(collectionRef, data);
    logFirestoreOperation('addDoc (write) - success', collection, result.id, data);
    return result;
  } catch (error) {
    logFirestoreOperation('addDoc (write) - error', collection, 'new-document', error);
    throw error;
  }
};

/**
 * Get all logged Firestore operations
 */
export const getFirestoreOperations = () => {
  return [...firestoreOperations];
};

/**
 * Get operations filtered by type
 */
export const getFirestoreOperationsByType = (type: 'read' | 'write') => {
  return firestoreOperations.filter(op => 
    type === 'write' 
      ? op.operation.includes('setDoc') || op.operation.includes('updateDoc') || op.operation.includes('addDoc')
      : op.operation.includes('getDoc') || op.operation.includes('getDocs')
  );
};

/**
 * Get user-related operations
 */
export const getUserOperations = () => {
  return firestoreOperations.filter(op => op.collection === 'users');
};

/**
 * Clear operation log
 */
export const clearFirestoreOperations = () => {
  firestoreOperations.length = 0;
  console.log('🧹 Firestore operation log cleared');
};

/**
 * Generate operation report
 */
export const generateOperationReport = () => {
  const totalOps = firestoreOperations.length;
  const writeOps = getFirestoreOperationsByType('write');
  const readOps = getFirestoreOperationsByType('read');
  const userOps = getUserOperations();
  
  const report = {
    summary: {
      totalOperations: totalOps,
      writeOperations: writeOps.length,
      readOperations: readOps.length,
      userOperations: userOps.length,
    },
    writeOperations: writeOps,
    userOperations: userOps,
    allOperations: firestoreOperations,
  };
  
  console.group('📊 Firestore Operations Report');
  console.log('Summary:', report.summary);
  console.log('Write Operations:', writeOps);
  console.log('User Operations:', userOps);
  console.groupEnd();
  
  return report;
};

/**
 * Allow role modifications for legitimate operations (like user registration/login)
 */
export const allowRoleModification = (operationId: string) => {
  roleModificationAllowed = true;
  allowedOperations.add(operationId);
  console.log(`✅ Role modification allowed for operation: ${operationId}`);

  // Auto-disable after 5 seconds to prevent abuse
  setTimeout(() => {
    roleModificationAllowed = false;
    allowedOperations.delete(operationId);
    console.log(`⏰ Role modification permission expired for operation: ${operationId}`);
  }, 5000);
};

/**
 * Check if role modification is currently allowed
 */
export const isRoleModificationAllowed = (): boolean => {
  return roleModificationAllowed && allowedOperations.size > 0;
};

/**
 * Initialize monitoring (call this on app startup)
 */
export const initializeFirestoreMonitoring = () => {
  console.log('🔍 Firestore operation monitoring initialized');

  // Log when monitoring starts
  logFirestoreOperation('monitoring-start', 'system', 'monitor', {
    message: 'Firestore monitoring initialized',
    url: window.location.href,
  });

  // Set up periodic reporting in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      if (firestoreOperations.length > 0) {
        generateOperationReport();
      }
    }, 30000); // Report every 30 seconds
  }
};
