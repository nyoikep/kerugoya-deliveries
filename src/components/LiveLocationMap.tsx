'use client';

import React, { useState, useMemo } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { useGoogleMaps } from '@/contexts/GoogleMapsContext';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

interface Location {
  latitude: number;
  longitude: number;
}

interface LiveLocationMapProps {
  clientLocation?: Location | null;
  riderLocation?: Location | null;
  pickupLocation?: Location | null;
  destinationLocation?: Location | null;
  center: Location;
  zoom?: number;
}

const LiveLocationMap: React.FC<LiveLocationMapProps> = ({ 
  clientLocation, 
  riderLocation, 
  pickupLocation,
  destinationLocation,
  center, 
  zoom = 13 
}) => {
  const { isLoaded } = useGoogleMaps();

  const [selectedMarker, setSelectedMarker] = useState<{ lat: number, lng: number, label: string } | null>(null);

  const initialCenter = useMemo(() => ({
    lat: center.latitude,
    lng: center.longitude
  }), [center]);

  if (!isLoaded) return <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={initialCenter}
      zoom={zoom}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true
      }}
    >
      {clientLocation && (
        <Marker 
          position={{ lat: clientLocation.latitude, lng: clientLocation.longitude }} 
          onClick={() => setSelectedMarker({ 
            lat: clientLocation.latitude, 
            lng: clientLocation.longitude, 
            label: "Client's Current Location" 
          })}
        />
      )}
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
      {pickupLocation && (
        <Marker 
          position={{ lat: pickupLocation.latitude, lng: pickupLocation.longitude }} 
          icon="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
          onClick={() => setSelectedMarker({ 
            lat: pickupLocation.latitude, 
            lng: pickupLocation.longitude, 
            label: "Pickup Location" 
          })}
        />
      )}
      {destinationLocation && (
        <Marker 
          position={{ lat: destinationLocation.latitude, lng: destinationLocation.longitude }} 
          icon="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png"
          onClick={() => setSelectedMarker({ 
            lat: destinationLocation.latitude, 
            lng: destinationLocation.longitude, 
            label: "Destination Location" 
          })}
        />
      )}

      {selectedMarker && (
        <InfoWindow
          position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="text-gray-900 font-medium">{selectedMarker.label}</div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default LiveLocationMap;
