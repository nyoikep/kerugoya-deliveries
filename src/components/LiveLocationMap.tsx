'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSocket } from '@/contexts/SocketContext';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const RiderIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3198/3198336.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});

const ClientIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

L.Marker.prototype.options.icon = DefaultIcon;

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function LiveLocationMap() {
  const socket = useSocket();
  const [locations, setLocations] = useState<any>({});
  const center: [number, number] = [-0.505, 37.285]; // Kerugoya center

  useEffect(() => {
    if (!socket) return;

    socket.emit('joinAdminRoom');

    socket.on('admin_location_update', (data: any) => {
      setLocations((prev: any) => ({
        ...prev,
        [`${data.type}_${data.deliveryId}`]: data
      }));
    });

    socket.on('rider_ping', (data: any) => {
       // Optional: Add some visual alert for new pings
       console.log("New delivery ping:", data);
    });

    return () => {
      socket.off('admin_location_update');
      socket.off('rider_ping');
    };
  }, [socket]);

  return (
    <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <RecenterMap center={center} />
      
      {Object.values(locations).map((loc: any) => (
        <Marker 
          key={`${loc.type}_${loc.deliveryId}`} 
          position={[loc.latitude, loc.longitude]}
          icon={loc.type === 'RIDER' ? RiderIcon : ClientIcon}
        >
          <Popup>
            <div className="font-bold">{loc.type} Update</div>
            <div className="text-xs">Request ID: {loc.deliveryId}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
