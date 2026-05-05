'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import type { ReportType } from '@huellita/shared';
import { MARKER_COLORS } from '@/lib/report-utils';

interface Props {
  lat: number;
  lng: number;
  type: ReportType;
}

export default function MiniMap({ lat, lng, type }: Props) {
  const color = MARKER_COLORS[type];
  const icon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="36">
      <path d="M12 0C7.16 0 3.2 3.96 3.2 8.8C3.2 15.4 12 28 12 28S20.8 15.4 20.8 8.8C20.8 3.96 16.84 0 12 0Z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="9" r="4" fill="white" opacity="0.9"/>
    </svg>`,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
  });

  return (
    <div className="h-52 rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={icon} />
      </MapContainer>
    </div>
  );
}
