'use client'; // This tells Next.js this file is allowed to run browser-only features

import dynamic from 'next/dynamic';

// We move the dynamic import here, safely inside a Client Component
const MapView = dynamic(() => import('./MapView'), { 
  ssr: false,
  loading: () => (
    <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #333', borderRadius: '12px', marginTop: '20px', color: '#888' }}>
      Loading Map...
    </div>
  )
});

export default function MapWrapper({ lat, lng, title }: { lat: number, lng: number, title: string }) {
  return <MapView lat={lat} lng={lng} title={title} />;
}