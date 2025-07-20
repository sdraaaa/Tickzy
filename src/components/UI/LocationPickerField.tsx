import React, { useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface LocationPickerFieldProps {
  value?: LocationData;
  onChange: (location: LocationData) => void;
  onError?: (error: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const LocationPickerField: React.FC<LocationPickerFieldProps> = ({
  value,
  onChange,
  onError,
  label = 'Event Location',
  required = false,
  disabled = false,
  className = ''
}) => {
  const [addressInput, setAddressInput] = useState(value?.address || '');
  const [error, setError] = useState<string | null>(null);

  // Handle address input change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setAddressInput(address);

    // Create a simple location object with default coordinates for Hyderabad
    const location: LocationData = {
      latitude: 17.4065, // Default to Hyderabad coordinates
      longitude: 78.4772,
      address: address
    };

    onChange(location);
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Address Input */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={addressInput}
          onChange={handleAddressChange}
          placeholder="Enter event location (e.g., Nehru Hall, MJCET, Hyderabad)"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          disabled={disabled}
          required={required}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Help text */}
      {!error && (
        <p className="text-xs text-gray-500">
          Enter the complete address where your event will take place. This helps attendees find the venue easily.
        </p>
      )}
    </div>
  );
};

export default LocationPickerField;
