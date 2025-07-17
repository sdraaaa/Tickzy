import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, DollarSign, Users, Clock, Image as ImageIcon, Save, Eye, Plus, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { canUserCreateEvents } from '@/services/hostService';
import { createEvent, TicketType } from '@/services/eventsService';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [canCreate, setCanCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Music',
    date: '',
    time: '',
    location: '',
    price: 0,
    attendees: 100,
    image: '',
    highlights: [''],
    ticketTypes: [
      { id: 1, name: 'General Admission', price: 0, description: 'Standard event access' }
    ] as TicketType[]
  });

  const categories = [
    'Music', 'Business', 'Lifestyle', 'Arts', 'Gaming', 'Sports'
  ];

  // Check if user can create events
  useEffect(() => {
    const checkPermissions = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const canCreateEvents = await canUserCreateEvents(currentUser.uid);
        setCanCreate(canCreateEvents);

        if (!canCreateEvents) {
          navigate('/user-dashboard');
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        navigate('/user-dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [currentUser, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.price < 0) newErrors.price = 'Price cannot be negative';
    if (formData.attendees < 1) newErrors.attendees = 'Capacity must be at least 1';
    if (!formData.image.trim()) newErrors.image = 'Event image URL is required';

    // Validate ticket types
    if (formData.ticketTypes.length === 0) {
      newErrors.ticketTypes = 'At least one ticket type is required';
    } else {
      formData.ticketTypes.forEach((ticket, index) => {
        if (!ticket.name.trim()) newErrors[`ticket_${index}_name`] = 'Ticket name is required';
        if (ticket.price < 0) newErrors[`ticket_${index}_price`] = 'Ticket price cannot be negative';
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const processedValue = type === 'number' ? Number(value) : value;

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleHighlightChange = (index: number, value: string) => {
    const newHighlights = [...formData.highlights];
    newHighlights[index] = value;
    setFormData(prev => ({ ...prev, highlights: newHighlights }));
  };

  const addHighlight = () => {
    setFormData(prev => ({
      ...prev,
      highlights: [...prev.highlights, '']
    }));
  };

  const removeHighlight = (index: number) => {
    if (formData.highlights.length > 1) {
      const newHighlights = formData.highlights.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, highlights: newHighlights }));
    }
  };

  const handleTicketTypeChange = (index: number, field: keyof TicketType, value: string | number) => {
    const newTicketTypes = [...formData.ticketTypes];
    newTicketTypes[index] = { ...newTicketTypes[index], [field]: value };
    setFormData(prev => ({ ...prev, ticketTypes: newTicketTypes }));

    // Clear related errors
    const errorKey = `ticket_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const addTicketType = () => {
    const newId = Math.max(...formData.ticketTypes.map(t => t.id)) + 1;
    setFormData(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, {
        id: newId,
        name: '',
        price: 0,
        description: ''
      }]
    }));
  };

  const removeTicketType = (index: number) => {
    if (formData.ticketTypes.length > 1) {
      const newTicketTypes = formData.ticketTypes.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, ticketTypes: newTicketTypes }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !currentUser || !userData) return;

    setSubmitting(true);
    try {
      const eventData = {
        ...formData,
        highlights: formData.highlights.filter(h => h.trim()),
        organizer: {
          name: userData.displayName || currentUser.displayName || 'Unknown Host',
          rating: 4.5, // Default rating for new hosts
          events: 1, // This would be calculated in a real app
          avatar: userData.photoURL || currentUser.photoURL || ''
        },
        createdBy: currentUser.uid,
        rating: 4.5 // Default rating for new events
      };

      const eventId = await createEvent(eventData);

      if (eventId) {
        navigate(`/event/${eventId}`, {
          state: { message: 'Event created successfully!' }
        });
      } else {
        setErrors({ submit: 'Failed to create event. Please try again.' });
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setErrors({ submit: 'Failed to create event. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (!canCreate) {
    return (
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need to be an approved host to create events.</p>
          <button
            onClick={() => navigate('/user-dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/host-dashboard')}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-200 mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600">Share your amazing event with the world</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-soft p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Display */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter event title"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <input
                  type="number"
                  name="attendees"
                  value={formData.attendees}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.attendees ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Maximum attendees"
                />
                {errors.attendees && <p className="text-red-500 text-sm mt-1">{errors.attendees}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Describe your event..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Date & Location */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Date & Location</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.time ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Event venue or address"
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
            </div>
          </div>
          {/* Media & Highlights */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Media & Highlights</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Image URL *
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.image ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://example.com/event-image.jpg"
              />
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
              {formData.image && (
                <div className="mt-3">
                  <img
                    src={formData.image}
                    alt="Event preview"
                    className="w-full h-48 object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Highlights
              </label>
              <div className="space-y-2">
                {formData.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={highlight}
                      onChange={(e) => handleHighlightChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter a highlight"
                    />
                    {formData.highlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addHighlight}
                  className="flex items-center text-primary-500 hover:text-primary-600 text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Highlight
                </button>
              </div>
            </div>
          </div>
          {/* Pricing & Tickets */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Pricing & Tickets</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Base Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.price ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Ticket Types *
                </label>
                <button
                  type="button"
                  onClick={addTicketType}
                  className="flex items-center text-primary-500 hover:text-primary-600 text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Ticket Type
                </button>
              </div>

              {errors.ticketTypes && <p className="text-red-500 text-sm mb-3">{errors.ticketTypes}</p>}

              <div className="space-y-4">
                {formData.ticketTypes.map((ticket, index) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Ticket Type {index + 1}</h4>
                      {formData.ticketTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTicketType(index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          value={ticket.name}
                          onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                            errors[`ticket_${index}_name`] ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="e.g., General Admission"
                        />
                        {errors[`ticket_${index}_name`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`ticket_${index}_name`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Price *
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            value={ticket.price}
                            onChange={(e) => handleTicketTypeChange(index, 'price', Number(e.target.value))}
                            min="0"
                            step="0.01"
                            className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm ${
                              errors[`ticket_${index}_price`] ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                          />
                        </div>
                        {errors[`ticket_${index}_price`] && (
                          <p className="text-red-500 text-xs mt-1">{errors[`ticket_${index}_price`]}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={ticket.description || ''}
                          onChange={(e) => handleTicketTypeChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          placeholder="Brief description of what's included"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/host-dashboard')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Event...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;