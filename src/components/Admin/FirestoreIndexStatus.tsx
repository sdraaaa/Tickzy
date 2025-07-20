/**
 * Firestore Index Status Component
 * 
 * Displays the current status of Firestore indexes and provides
 * deployment instructions for missing indexes.
 */

import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertTriangle, Terminal, Copy, ExternalLink } from 'lucide-react';
import { 
  checkIndexStatus, 
  generateDeploymentInstructions, 
  getStoredInstructions,
  areIndexesMissing,
  IndexStatus 
} from '@/services/firestoreIndexService';

const FirestoreIndexStatus: React.FC = () => {
  const [indexStatus, setIndexStatus] = useState<IndexStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadIndexStatus();
    
    // Check for stored instructions
    const storedInstructions = getStoredInstructions();
    if (storedInstructions) {
      setInstructions(storedInstructions);
      setShowInstructions(areIndexesMissing());
    }
  }, []);

  const loadIndexStatus = async () => {
    try {
      setLoading(true);
      const status = await checkIndexStatus();
      setIndexStatus(status);
      
      if (status.missing.length > 0) {
        const deployInstructions = generateDeploymentInstructions(status.missing);
        setInstructions(deployInstructions);
        setShowInstructions(true);
      } else {
        setShowInstructions(false);
      }
    } catch (error) {
      console.error('Error loading index status:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInstructions = async () => {
    if (instructions) {
      try {
        await navigator.clipboard.writeText(instructions);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy instructions:', error);
      }
    }
  };

  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/project/tickzy-e986b/firestore/indexes', '_blank');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <Database className="w-5 h-5 text-blue-500 animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900">Checking Firestore Indexes...</h3>
        </div>
        <div className="mt-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!indexStatus) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-6">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-red-900">Index Status Check Failed</h3>
        </div>
        <p className="mt-2 text-red-700">Unable to check Firestore index status. Please try again.</p>
        <button
          onClick={loadIndexStatus}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry Check
        </button>
      </div>
    );
  }

  const hasIssues = indexStatus.missing.length > 0;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className={`rounded-lg shadow-sm border p-6 ${
        hasIssues ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {hasIssues ? (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            <h3 className={`text-lg font-semibold ${
              hasIssues ? 'text-yellow-900' : 'text-green-900'
            }`}>
              Firestore Indexes Status
            </h3>
          </div>
          <button
            onClick={openFirebaseConsole}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Firebase Console</span>
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{indexStatus.required.length}</div>
            <div className="text-sm text-gray-600">Required</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{indexStatus.available.length}</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{indexStatus.missing.length}</div>
            <div className="text-sm text-gray-600">Missing</div>
          </div>
        </div>

        {hasIssues && (
          <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
            <p className="text-yellow-800 font-medium">
              ⚠️ {indexStatus.missing.length} index(es) need to be created for optimal performance.
            </p>
          </div>
        )}
      </div>

      {/* Deployment Instructions */}
      {hasIssues && showInstructions && instructions && (
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Terminal className="w-5 h-5 text-green-400" />
              <h4 className="text-lg font-semibold text-white">Deployment Instructions</h4>
            </div>
            <button
              onClick={copyInstructions}
              className={`flex items-center space-x-2 px-3 py-1 text-sm rounded-lg transition-colors ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          
          <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap overflow-x-auto">
            {instructions}
          </pre>
        </div>
      )}

      {/* Index Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Index Details</h4>
        
        <div className="space-y-4">
          {indexStatus.required.map((index, idx) => {
            const isAvailable = indexStatus.available.some(avail => 
              avail.description === index.description
            );
            
            return (
              <div key={idx} className={`p-4 rounded-lg border ${
                isAvailable 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isAvailable ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`font-medium ${
                      isAvailable ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {index.description}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isAvailable ? 'Available' : 'Missing'}
                  </span>
                </div>
                
                <div className="mt-2 text-sm text-gray-600">
                  <strong>Collection:</strong> {index.collection} | 
                  <strong> Fields:</strong> {index.fields.map(f => `${f.field} (${f.direction})`).join(', ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadIndexStatus}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default FirestoreIndexStatus;
