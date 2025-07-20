import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Users, DollarSign, FileText, Download, Eye, Check, AlertTriangle, User } from 'lucide-react';
import { Event } from '@/services/eventsService';
import EventStatusBadge, { EventStatus } from '@/components/Events/EventStatusBadge';

interface EventDetailsModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (eventId: string) => void;
  onReject: (eventId: string, reason?: string) => void;
  onDelete: (eventId: string) => void;
  isProcessing: boolean;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onDelete,
  isProcessing
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen) return null;

  const handleRejectSubmit = () => {
    onReject(event.id, rejectReason.trim() || undefined);
    setRejectReason('');
    setShowRejectForm(false);
  };

  const handleDeleteConfirm = () => {
    onDelete(event.id);
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
            <EventStatusBadge status={event.status as EventStatus} />
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Event Image */}
          <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-event.jpg';
              }}
            />
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{event.title}</h3>
            <p className="text-gray-600 mb-4">{event.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(event.date)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">{formatTime(event.time)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{event.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium">${event.price}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-medium">{event.attendees} people</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Organizer</p>
                  <p className="font-medium">{event.organizer?.name || 'Unknown'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Venue Document */}
          {(event as any).venueDocument && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-blue-900">Venue Booking Document</h4>
                    <p className="text-sm text-blue-700">Uploaded by event organizer</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open((event as any).venueDocument, '_blank')}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = (event as any).venueDocument;
                      link.download = `venue-document-${event.id}`;
                      link.click();
                    }}
                    className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Event Highlights */}
          {event.highlights && event.highlights.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Event Highlights</h4>
              <ul className="list-disc list-inside space-y-1">
                {event.highlights.map((highlight, index) => (
                  <li key={index} className="text-gray-600">{highlight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Ticket Types */}
          {event.ticketTypes && event.ticketTypes.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Ticket Types</h4>
              <div className="space-y-2">
                {event.ticketTypes.map((ticket, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{ticket.name}</p>
                      {ticket.description && <p className="text-sm text-gray-600">{ticket.description}</p>}
                    </div>
                    <p className="font-medium">${ticket.price}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rejection Reason (if rejected) */}
          {event.status === 'rejected' && (event as any).rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Rejection Reason</h4>
                  <p className="text-red-700 mt-1">{(event as any).rejectionReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {event.status === 'pending' && (
              <>
                <button
                  onClick={() => onApprove(event.id)}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Event</span>
                </button>
                
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Reject Event</span>
                </button>
              </>
            )}
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Delete Event</span>
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Close
          </button>
        </div>

        {/* Reject Form Modal */}
        {showRejectForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Reject Event</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason (optional)"
                className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                rows={4}
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Delete Event</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to permanently delete this event? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsModal;
