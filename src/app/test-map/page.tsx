'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';

import NoSSR from '@/components/NoSSR';

export default function TestMapPage() {
  const Map = useMemo(() => dynamic(() => import('@/components/LiveLocationMap'), {
    ssr: false,
    loading: () => <p>Loading map...</p>,
  }), []);

  const center = { latitude: -1.286389, longitude: 36.817223 }; // Nairobi

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h1>Test Page for Leaflet Map</h1>
      <div style={{ height: '80%', width: '80%', margin: 'auto' }}>
        <NoSSR>
          <Map center={center} />
        </NoSSR>
      </div>
    </div>
  );
}
