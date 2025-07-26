/**
 * AdminLogs Component
 * 
 * Display admin action logs with timestamps and details
 */

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';

interface AdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: 'user' | 'event' | 'hostRequest';
  targetId: string;
  targetName?: string;
  details: string;
  timestamp: any;
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminLogs();
  }, []);

  const fetchAdminLogs = async () => {
    setLoading(true);
    try {
      // Try to fetch recent admin logs (limit to 100 most recent)
      const logsQuery = query(
        collection(db, 'adminLogs'),
        orderBy('timestamp', 'desc'),
        limit(100)
      );

      const logsSnapshot = await getDocs(logsQuery);
      const logsData = logsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminLog[];


      setLogs(logsData);
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      // If adminLogs collection doesn't exist yet, just set empty array
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'approve':
      case 'approved':
        return (
          <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'reject':
      case 'rejected':
      case 'delete':
      case 'deleted':
        return (
          <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'update':
      case 'updated':
        return (
          <div className="w-8 h-8 bg-blue-600/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getTargetTypeColor = (targetType: string) => {
    switch (targetType) {
      case 'user': return 'bg-purple-600/20 text-purple-300';
      case 'event': return 'bg-blue-600/20 text-blue-300';
      case 'hostRequest': return 'bg-green-600/20 text-green-300';
      default: return 'bg-gray-600/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        <span className="ml-4 text-white">Loading admin logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Admin Activity Logs</h2>
        <button
          onClick={fetchAdminLogs}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Refresh
        </button>
      </div>

      <div className="bg-neutral-800 rounded-xl border border-gray-700">
        <div className="p-6">
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-4 p-4 bg-neutral-700/50 rounded-lg">
                {getActionIcon(log.action)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-white font-medium">{log.action}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTargetTypeColor(log.targetType)}`}>
                      {log.targetType}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-2">{log.details}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>By: {log.adminEmail}</span>
                    <span>•</span>
                    <span>
                      {log.timestamp?.toDate ? 
                        log.timestamp.toDate().toLocaleString() : 
                        new Date(log.timestamp).toLocaleString()
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {logs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Activity Logs</h3>
          <p className="text-gray-400">No admin actions have been logged yet.</p>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
