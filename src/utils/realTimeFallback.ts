/**
 * Real-time Fallback and Error Handling System
 * 
 * Provides comprehensive error handling and fallback mechanisms for real-time synchronization
 */

import { 
  enableNetwork, 
  disableNetwork, 
  connectFirestoreEmulator,
  onSnapshot,
  collection,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '@/firebase';

// Connection state management
interface ConnectionState {
  isOnline: boolean;
  lastConnected: Date | null;
  retryCount: number;
  maxRetries: number;
  retryDelay: number;
}

let connectionState: ConnectionState = {
  isOnline: true,
  lastConnected: new Date(),
  retryCount: 0,
  maxRetries: 5,
  retryDelay: 1000
};

// Error types for better handling
export enum RealTimeErrorType {
  NETWORK_ERROR = 'network_error',
  PERMISSION_DENIED = 'permission_denied',
  QUOTA_EXCEEDED = 'quota_exceeded',
  UNAVAILABLE = 'unavailable',
  UNKNOWN = 'unknown'
}

export interface RealTimeError {
  type: RealTimeErrorType;
  message: string;
  code?: string;
  retryable: boolean;
  timestamp: Date;
}

// Error classification
export const classifyFirestoreError = (error: any): RealTimeError => {
  const timestamp = new Date();
  
  if (!error.code) {
    return {
      type: RealTimeErrorType.UNKNOWN,
      message: error.message || 'Unknown error occurred',
      retryable: true,
      timestamp
    };
  }
  
  switch (error.code) {
    case 'permission-denied':
      return {
        type: RealTimeErrorType.PERMISSION_DENIED,
        message: 'Permission denied. Check authentication and security rules.',
        code: error.code,
        retryable: false,
        timestamp
      };
      
    case 'unavailable':
      return {
        type: RealTimeErrorType.UNAVAILABLE,
        message: 'Firestore service temporarily unavailable. Retrying...',
        code: error.code,
        retryable: true,
        timestamp
      };
      
    case 'resource-exhausted':
    case 'quota-exceeded':
      return {
        type: RealTimeErrorType.QUOTA_EXCEEDED,
        message: 'Quota exceeded. Please try again later.',
        code: error.code,
        retryable: true,
        timestamp
      };
      
    case 'failed-precondition':
      return {
        type: RealTimeErrorType.NETWORK_ERROR,
        message: 'Missing Firestore index. Check console for index creation instructions.',
        code: error.code,
        retryable: false,
        timestamp
      };
      
    default:
      if (error.message?.includes('network') || error.message?.includes('offline')) {
        return {
          type: RealTimeErrorType.NETWORK_ERROR,
          message: 'Network connection lost. Attempting to reconnect...',
          code: error.code,
          retryable: true,
          timestamp
        };
      }
      
      return {
        type: RealTimeErrorType.UNKNOWN,
        message: error.message || 'Unknown Firestore error',
        code: error.code,
        retryable: true,
        timestamp
      };
  }
};

// Enhanced retry mechanism
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const classifiedError = classifyFirestoreError(error);
      
      console.warn(`Attempt ${attempt + 1}/${maxRetries + 1} failed:`, classifiedError.message);
      
      // Don't retry non-retryable errors
      if (!classifiedError.retryable) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(backoffMultiplier, attempt);
      console.log(`Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Connection monitoring and recovery
export const monitorConnection = () => {
  const handleOnline = async () => {
    console.log('🌐 Network connection restored');
    connectionState.isOnline = true;
    connectionState.lastConnected = new Date();
    connectionState.retryCount = 0;
    
    try {
      await enableNetwork(db);
      console.log('✅ Firestore network enabled');
    } catch (error) {
      console.error('❌ Failed to enable Firestore network:', error);
    }
  };

  const handleOffline = () => {
    console.log('📴 Network connection lost');
    connectionState.isOnline = false;
  };

  // Browser network events
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Firestore connection monitoring
  const testConnection = async () => {
    try {
      // Simple query to test connection
      const testQuery = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        testQuery,
        () => {
          if (!connectionState.isOnline) {
            handleOnline();
          }
        },
        (error) => {
          console.warn('Firestore connection test failed:', error);
          if (connectionState.isOnline) {
            handleOffline();
          }
        }
      );
      
      // Clean up after 5 seconds
      setTimeout(() => unsubscribe(), 5000);
    } catch (error) {
      console.error('Connection test setup failed:', error);
    }
  };
  
  // Test connection every 30 seconds
  const connectionTestInterval = setInterval(testConnection, 30000);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    clearInterval(connectionTestInterval);
  };
};

// Fallback data loading
export const loadDataWithFallback = async <T>(
  primaryLoader: () => Promise<T>,
  fallbackLoader: () => Promise<T>,
  cacheKey?: string
): Promise<T> => {
  try {
    // Try primary loader first
    const result = await withRetry(primaryLoader);
    
    // Cache successful result if cache key provided
    if (cacheKey && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`fallback_cache_${cacheKey}`, JSON.stringify({
          data: result,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.warn('Failed to cache data:', error);
      }
    }
    
    return result;
  } catch (primaryError) {
    console.warn('Primary data loader failed, trying fallback:', primaryError);
    
    try {
      // Try fallback loader
      return await withRetry(fallbackLoader);
    } catch (fallbackError) {
      console.error('Fallback data loader also failed:', fallbackError);
      
      // Try to load from cache as last resort
      if (cacheKey && typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(`fallback_cache_${cacheKey}`);
          if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            const age = Date.now() - timestamp;
            
            // Use cached data if it's less than 1 hour old
            if (age < 3600000) {
              console.log('Using cached data as fallback');
              return data;
            }
          }
        } catch (cacheError) {
          console.warn('Failed to load cached data:', cacheError);
        }
      }
      
      // Re-throw the original error if all fallbacks fail
      throw primaryError;
    }
  }
};

// Real-time subscription with automatic fallback
export const createResilientSubscription = <T>(
  queryBuilder: () => any,
  onData: (data: T[]) => void,
  onError?: (error: RealTimeError) => void,
  dataConverter?: (doc: any) => T
) => {
  let isActive = true;
  let currentUnsubscribe: (() => void) | null = null;
  let retryTimeout: NodeJS.Timeout | null = null;
  
  const cleanup = () => {
    isActive = false;
    if (currentUnsubscribe) {
      currentUnsubscribe();
      currentUnsubscribe = null;
    }
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      retryTimeout = null;
    }
  };
  
  const subscribe = () => {
    if (!isActive) return;
    
    try {
      const query = queryBuilder();
      
      currentUnsubscribe = onSnapshot(
        query,
        (snapshot) => {
          const data: T[] = [];
          snapshot.forEach((doc) => {
            try {
              const item = dataConverter ? dataConverter(doc) : doc.data() as T;
              data.push(item);
            } catch (error) {
              console.error('Error converting document:', error);
            }
          });
          
          onData(data);
          connectionState.retryCount = 0; // Reset retry count on success
        },
        (error) => {
          const classifiedError = classifyFirestoreError(error);
          console.error('Real-time subscription error:', classifiedError);
          
          if (onError) {
            onError(classifiedError);
          }
          
          // Retry if error is retryable and we haven't exceeded max retries
          if (classifiedError.retryable && connectionState.retryCount < connectionState.maxRetries) {
            connectionState.retryCount++;
            const delay = connectionState.retryDelay * Math.pow(2, connectionState.retryCount - 1);
            
            console.log(`Retrying subscription in ${delay}ms (attempt ${connectionState.retryCount}/${connectionState.maxRetries})`);
            
            retryTimeout = setTimeout(() => {
              if (isActive) {
                subscribe();
              }
            }, delay);
          } else {
            console.error('Max retries exceeded or non-retryable error. Subscription stopped.');
          }
        }
      );
    } catch (error) {
      console.error('Failed to create subscription:', error);
      if (onError) {
        onError(classifyFirestoreError(error));
      }
    }
  };
  
  // Start the subscription
  subscribe();
  
  return cleanup;
};

// Get connection state
export const getConnectionState = () => ({ ...connectionState });

// Force reconnection
export const forceReconnection = async () => {
  try {
    console.log('🔄 Forcing Firestore reconnection...');
    await disableNetwork(db);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await enableNetwork(db);
    connectionState.retryCount = 0;
    connectionState.isOnline = true;
    connectionState.lastConnected = new Date();
    console.log('✅ Firestore reconnection completed');
  } catch (error) {
    console.error('❌ Error during forced reconnection:', error);
    throw error;
  }
};

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).classifyFirestoreError = classifyFirestoreError;
  (window as any).withRetry = withRetry;
  (window as any).monitorConnection = monitorConnection;
  (window as any).loadDataWithFallback = loadDataWithFallback;
  (window as any).createResilientSubscription = createResilientSubscription;
  (window as any).getConnectionState = getConnectionState;
  (window as any).forceReconnection = forceReconnection;
}
