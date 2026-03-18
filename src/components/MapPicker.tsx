'use client';

import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: -0.502,
  lng: 37.283 // Default to Kerugoya
};

interface MapPickerProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  riderLocation?: { latitude: number; longitude: number } | null;
  initialPickupSearch?: string;
  initialDestinationSearch?: string;
  simulatedDrivers?: { lat: number; lng: number; id: string }[] | null;
  mode?: 'pickup' | 'destination';
  otherLocation?: { lat: number; lng: number } | null;
}

export default function MapPicker({ 
  onLocationSelect, 
  userLocation, 
  riderLocation, 
  initialPickupSearch, 
  initialDestinationSearch, 
  simulatedDrivers,
  mode = 'pickup',
  otherLocation
}: MapPickerProps) {
  const { isLoaded } = useGoogleMaps();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [pickupLatLng, setPickupLatLng] = useState<{ lat: number, lng: number } | null>(null);
  const [destinationLatLng, setDestinationLatLng] = useState<{ lat: number, lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedMarker, setSelectedMarker] = useState<{ lat: number, lng: number, label: string } | null>(null);

  const geocodeLocation = async (query: string, setter: (latlng: { lat: number, lng: number }) => void) => {
    try {
      const response = await fetch(`/api/geocode?query=${encodeURIComponent(query + ', Kerugoya, Kenya')}`);
      const data = await response.json();

      if (response.ok && data && data.lat && data.lng) {
        const newPos = { lat: data.lat, lng: data.lng };
        setter(newPos);
        if (map) {
          map.panTo(newPos);
          map.setZoom(16);
        }
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      return false;
    }
  };

  useEffect(() => {
    if (initialPickupSearch && isLoaded) {
      geocodeLocation(initialPickupSearch, setPickupLatLng);
    }
  }, [initialPickupSearch, isLoaded, map]);

  useEffect(() => {
    if (initialDestinationSearch && isLoaded) {
      geocodeLocation(initialDestinationSearch, setDestinationLatLng);
    }
  }, [initialDestinationSearch, isLoaded, map]);

  const handleSearch = async () => {
    setErrorMessage('');
    if (!searchQuery.trim()) {
      setErrorMessage('Please enter a location to search.');
      return;
    }

    const success = await geocodeLocation(searchQuery, (pos) => {
        if (onLocationSelect) {
            onLocationSelect(pos);
        }
        if (mode === 'pickup') setPickupLatLng(pos);
        else setDestinationLatLng(pos);
    });
    
    if (!success) {
      setErrorMessage('Location not found. Please try a different search term or click on the map.');
    }
  };

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && onLocationSelect) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onLocationSelect({ lat, lng });
      if (mode === 'pickup') setPickupLatLng({ lat, lng });
      else setDestinationLatLng({ lat, lng });
    }
  }, [onLocationSelect, mode]);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  const initialCenter = useMemo(() => {
    if (pickupLatLng) return pickupLatLng;
    if (userLocation) return { lat: userLocation.latitude, lng: userLocation.longitude };
    return defaultCenter;
  }, [pickupLatLng, userLocation]);

  if (!isLoaded) return <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">Loading Map...</div>;

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
       {onLocationSelect && <div className="mb-2 flex gap-2 p-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a location..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Search
        </button>
      </div>}
      {errorMessage && <p className="text-red-500 mb-2 px-2">{errorMessage}</p>}
      
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={initialCenter}
        zoom={13}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true
        }}
      >
        {/* Pickup Marker */}
        {(pickupLatLng || (mode === 'destination' && otherLocation)) && (
          <Marker 
            position={pickupLatLng || (otherLocation as { lat: number, lng: number })} 
            icon="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
            onClick={() => setSelectedMarker({ 
                lat: (pickupLatLng || otherLocation)!.lat, 
                lng: (pickupLatLng || otherLocation)!.lng, 
                label: "Pickup Location" 
            })}
          />
        )}

        {/* Destination Marker */}
        {(destinationLatLng || (mode === 'pickup' && otherLocation)) && (
          <Marker 
            position={destinationLatLng || (otherLocation as { lat: number, lng: number })} 
            icon="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png"
            onClick={() => setSelectedMarker({ 
                lat: (destinationLatLng || otherLocation)!.lat, 
                lng: (destinationLatLng || otherLocation)!.lng, 
                label: "Destination Location" 
            })}
          />
        )}

        {/* User Current Location */}
        {userLocation && (
          <Marker 
            position={{ lat: userLocation.latitude, lng: userLocation.longitude }} 
            icon="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png"
            onClick={() => setSelectedMarker({ 
                lat: userLocation.latitude, 
                lng: userLocation.longitude, 
                label: "Your Current Location" 
            })}
          />
        )}

        {/* Rider Location */}
        {riderLocation && (
          <Marker 
            position={{ lat: riderLocation.latitude, lng: riderLocation.longitude }} 
            icon="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
            onClick={() => setSelectedMarker({ 
                lat: riderLocation.latitude, 
                lng: riderLocation.longitude, 
                label: "Rider's Location" 
            })}
          />
        )}

        {/* Simulated Drivers */}
        {simulatedDrivers && simulatedDrivers.map(driver => (
          <Marker 
            key={driver.id} 
            position={{ lat: driver.lat, lng: driver.lng }} 
            icon="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
            onClick={() => setSelectedMarker({ 
                lat: driver.lat, 
                lng: driver.lng, 
                label: "Simulated Driver" 
            })}
          />
        ))}

        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div className="text-gray-900 font-medium">{selectedMarker.label}</div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
