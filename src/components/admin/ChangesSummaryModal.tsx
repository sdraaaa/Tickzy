/**
 * ChangesSummaryModal Component
 * 
 * Shows admins exactly what changes were made to an event by the host
 * Displays before/after comparison for easy review
 */

import React from 'react';
import { Event } from '../../types';

interface ChangesSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
}

const ChangesSummaryModal: React.FC<ChangesSummaryModalProps> = ({
  isOpen,
  onClose,
  event
}) => {
  if (!isOpen || !event.originalValues) return null;

  // Helper function to detect changes
  const hasChanged = (field: keyof typeof event.originalValues) => {
    const original = event.originalValues?.[field];
    const current = event[field];
    return original !== current;
  };

  // Helper function to format values for display
  const formatValue = (value: any, field: string) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-gray-500 italic">Not set</span>;
    }
    if (field === 'price') {
      return `$${value}`;
    }
    if (field === 'capacity') {
      return `${value} seats`;
    }
    return value;
  };

  const changes = [
    { field: 'title', label: 'Event Title' },
    { field: 'description', label: 'Description' },
    { field: 'venue', label: 'Venue Name' },
    { field: 'location', label: 'Location' },
    { field: 'capacity', label: 'Capacity' },
    { field: 'price', label: 'Ticket Price' }
  ] as const;

  const changedFields = changes.filter(change => hasChanged(change.field));
  const unchangedFields = changes.filter(change => !hasChanged(change.field));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <div>
            <h3 className="text-xl font-bold text-white">Event Changes Summary</h3>
            <p className="text-gray-400 text-sm mt-1">Review modifications made by the host</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Event Info Header */}
          <div className="bg-neutral-700 rounded-lg p-4 mb-6">
            <h4 className="text-white font-medium mb-2">Event: {event.title}</h4>
            <div className="text-sm text-gray-300">
              <p>Host: {event.hostName || event.hostEmail}</p>
              <p>Last Modified: {event.updatedAt?.toDate?.()?.toLocaleString() || 'Unknown'}</p>
              {event.modificationReason && (
                <p>Reason: {event.modificationReason}</p>
              )}
            </div>
          </div>

          {/* Changes Summary */}
          {changedFields.length > 0 ? (
            <div className="space-y-6">
              <div className="bg-orange-900/20 border border-orange-600/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h4 className="text-orange-400 font-medium">
                    {changedFields.length} Field{changedFields.length > 1 ? 's' : ''} Modified
                  </h4>
                </div>
                
                <div className="space-y-4">
                  {changedFields.map(({ field, label }) => (
                    <div key={field} className="bg-neutral-800 rounded-lg p-4">
                      <h5 className="text-white font-medium mb-3">{label}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Before */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-red-400 font-medium text-sm">Before</span>
                          </div>
                          <div className="bg-red-900/20 border border-red-600/30 rounded p-3">
                            <div className="text-red-200">
                              {formatValue(event.originalValues?.[field], field)}
                            </div>
                          </div>
                        </div>
                        
                        {/* After */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-green-400 font-medium text-sm">After</span>
                          </div>
                          <div className="bg-green-900/20 border border-green-600/30 rounded p-3">
                            <div className="text-green-200">
                              {formatValue(event[field], field)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unchanged Fields */}
              {unchangedFields.length > 0 && (
                <div className="bg-neutral-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-gray-400 font-medium">
                      {unchangedFields.length} Field{unchangedFields.length > 1 ? 's' : ''} Unchanged
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {unchangedFields.map(({ label }) => (
                      <div key={label} className="text-gray-500 text-sm">
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Changes Detected</h3>
              <p className="text-gray-400">This event appears to have no modifications.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end pt-6 border-t border-gray-700 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangesSummaryModal;
