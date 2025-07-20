import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { createEvent, TicketType } from '@/services/eventsService';
import ImageUploadField from '@/components/UI/ImageUploadField';
import DocumentUploadField from '@/components/UI/DocumentUploadField';

const CreateEvent: React.FC = () => {
  console.log('CreateEvent component is rendering!');

  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();

  // Debug user authentication and role
  console.log('🔍 User Authentication Debug:', {
    isAuthenticated: !!currentUser,
    userId: currentUser?.uid,
    userEmail: currentUser?.email,
    userData: userData,
    userRole: userData?.role,
    hostStatus: userData?.hostStatus
  });
  const [tempEventId] = useState(() => `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: '',
    price: '',
    attendees: '',
    image: '',
    venueDocument: '',
    highlights: [''],
    ticketTypes: [
      { id: 1, name: 'General Admission', price: 0, description: '' }
    ] as TicketType[]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
  };

  const handleDocumentChange = (documentUrl: string) => {
    setFormData(prev => ({ ...prev, venueDocument: documentUrl }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      alert('Event title is required');
      return false;
    }
    if (!formData.description.trim()) {
      alert('Event description is required');
      return false;
    }
    if (!formData.category) {
      alert('Event category is required');
      return false;
    }
    if (!formData.date) {
      alert('Event date is required');
      return false;
    }
    if (!formData.time) {
      alert('Event time is required');
      return false;
    }
    if (!formData.location.trim()) {
      alert('Event location is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      alert('Valid price is required');
      return false;
    }
    if (!formData.attendees || parseInt(formData.attendees) < 1) {
      alert('Valid capacity is required');
      return false;
    }
    if (!formData.image.trim()) {
      alert('Event banner image is required');
      return false;
    }
    if (!formData.venueDocument.trim()) {
      alert('Venue booking document is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!currentUser) {
      alert('You must be logged in to create an event');
      return;
    }

    setSubmitting(true);

    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        date: formData.date,
        time: formData.time,
        location: formData.location.trim(),
        price: parseFloat(formData.price),
        attendees: parseInt(formData.attendees),
        image: formData.image.trim(),
        venueDocument: formData.venueDocument.trim(),
        highlights: formData.highlights.filter(h => h.trim()),
        ticketTypes: formData.ticketTypes.map(tt => ({
          ...tt,
          price: parseFloat(tt.price.toString())
        })),
        organizer: {
          name: userData?.displayName || currentUser.displayName || 'Event Host',
          rating: 4.5,
          events: 1,
          avatar: userData?.photoURL || currentUser.photoURL || ''
        },
        createdBy: currentUser.uid,
        rating: 4.5,
        status: 'pending' as const
      };

      const eventId = await createEvent(eventData);

      if (eventId) {
        alert('Event created successfully! It will be reviewed by our team before going live.');
        navigate('/host-dashboard');
      }
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      {/* Success Banner */}
      <div style={{
        backgroundColor: 'green',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0', fontSize: '20px' }}>✅ CREATE EVENT PAGE IS WORKING!</h1>
      </div>

      {/* Form Container */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#333', marginBottom: '25px', fontSize: '24px' }}>Create New Event</h2>

        <form onSubmit={handleSubmit}>
          {/* Event Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter event title"
              required
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              placeholder="Describe your event"
              required
            />
          </div>

          {/* Category */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              required
            >
              <option value="">Select category</option>
              <option value="Music">Music</option>
              <option value="Sports">Sports</option>
              <option value="Arts">Arts</option>
              <option value="Food">Food</option>
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Date and Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                Time *
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Enter event location"
              required
            />
          </div>

          {/* Price and Capacity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                Capacity *
              </label>
              <input
                type="number"
                min="1"
                value={formData.attendees}
                onChange={(e) => handleInputChange('attendees', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
                placeholder="Maximum attendees"
                required
              />
            </div>
          </div>

          {/* Event Banner Image Upload */}
          <div style={{ marginBottom: '30px' }}>
            <ImageUploadField
              value={formData.image}
              onChange={handleImageChange}
              eventId={tempEventId}
              label="Event Banner Image"
              required={true}
            />
          </div>

          {/* Venue Booking Document Upload */}
          <div style={{ marginBottom: '30px' }}>
            <DocumentUploadField
              value={formData.venueDocument}
              onChange={handleDocumentChange}
              eventId={tempEventId}
              label="Venue Booking Document"
              required={true}
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Upload your venue booking confirmation, contract, or permission letter (PDF, DOC, DOCX)
            </p>
          </div>

          {/* Submit Button */}
          <div style={{ textAlign: 'center', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/host-dashboard')}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: submitting ? '#6c757d' : '#28a745',
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '6px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
              disabled={submitting}
            >
              {submitting ? '⏳ Creating...' : '🎉 Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
