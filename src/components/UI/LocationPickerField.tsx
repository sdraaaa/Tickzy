import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { Search, MapPin, Edit3, CheckCircle, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Set default icon for all markers
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

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

// Default center: Hyderabad, India (MJCET area)
const DEFAULT_CENTER: [number, number] = [17.4065, 78.4772];
const DEFAULT_ZOOM = 13;

// Nominatim geocoding service
const geocodeAddress = async (query: string): Promise<LocationData[]> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    
    return data.map((item: any) => ({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: item.display_name
    }));
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to search locations. Please try again.');
  }
};

// Reverse geocoding to get address from coordinates
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

// Map click handler component
const MapClickHandler: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void;
  disabled: boolean;
}> = ({ onLocationSelect, disabled }) => {
  useMapEvents({
    click: (e) => {
      if (!disabled) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const LocationPickerField: React.FC<LocationPickerFieldProps> = ({
  value,
  onChange,
  onError,
  label = 'Event Location',
  required = false,
  disabled = false,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isEditing, setIsEditing] = useState(!value);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Handle search
  const handleSearch = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const results = await geocodeAddress(query);
      setSearchResults(results);
      setShowResults(true);
    } catch (error: any) {
      const errorMsg = error.message || 'Search failed';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, [onError]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  // Handle location selection from search results
  const handleLocationSelect = useCallback(async (location: LocationData) => {
    onChange(location);
    setSearchQuery('');
    setShowResults(false);
    setIsEditing(false);
    setError(null);
  }, [onChange]);

  // Handle map click
  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    setError(null);

    try {
      const address = await reverseGeocode(lat, lng);
      const location: LocationData = {
        latitude: lat,
        longitude: lng,
        address
      };
      
      onChange(location);
      setIsEditing(false);
    } catch (error: any) {
      const errorMsg = 'Failed to get address for selected location';
      setError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsLoadingAddress(false);
    }
  }, [onChange, onError]);

  // Handle edit button click
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setError(null);
  }, []);

  // Get map center and marker position
  const mapCenter: [number, number] = value 
    ? [value.latitude, value.longitude] 
    : DEFAULT_CENTER;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Search Input */}
      {isEditing && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location (e.g., Nehru Hall, MJCET, Hyderabad)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              disabled={disabled}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleLocationSelect(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-gray-50 focus:outline-none"
                  disabled={disabled}
                >
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.address.split(',')[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {result.address}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Location Display */}
      {!isEditing && value && (
        <div className="flex items-start justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2 flex-1 min-w-0">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-900">Selected Location</p>
              <p className="text-sm text-green-700 break-words">{value.address}</p>
              <p className="text-xs text-green-600 mt-1">
                {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEdit}
            className="ml-2 p-1 text-green-600 hover:text-green-800 focus:outline-none"
            disabled={disabled}
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Map */}
      {isEditing && (
        <div className="relative">
          <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
            <MapContainer
              center={mapCenter}
              zoom={DEFAULT_ZOOM}
              style={{ height: '100%', width: '100%' }}
              className={disabled ? 'pointer-events-none opacity-50' : ''}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Map click handler */}
              <MapClickHandler
                onLocationSelect={handleMapClick}
                disabled={disabled || isLoadingAddress}
              />

              {/* Marker for selected location */}
              {value && (
                <Marker
                  position={[value.latitude, value.longitude]}
                  icon={DefaultIcon}
                />
              )}
            </MapContainer>
          </div>

          {/* Loading overlay */}
          {isLoadingAddress && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                <span className="text-sm">Getting address...</span>
              </div>
            </div>
          )}

          {/* Map instructions */}
          <p className="text-xs text-gray-500 mt-2">
            Search for a location above or click anywhere on the map to select a location.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Help text */}
      {!error && isEditing && (
        <p className="text-xs text-gray-500">
          Choose the exact location where your event will take place. This helps attendees find the venue easily.
        </p>
      )}
    </div>
  );
};

export default LocationPickerField;
