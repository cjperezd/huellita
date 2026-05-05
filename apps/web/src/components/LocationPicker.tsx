'use client';

import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

const BAHIA_BLANCA = { lat: -38.7196, lng: -62.2724 } as const;

interface Coords {
  lat: number;
  lng: number;
}

interface Props {
  value: Coords | null;
  onChange: (coords: Coords) => void;
}

const markerIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="36">
    <path d="M12 0C7.16 0 3.2 3.96 3.2 8.8C3.2 15.4 12 28 12 28S20.8 15.4 20.8 8.8C20.8 3.96 16.84 0 12 0Z"
      fill="#3b82f6" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="9" r="4" fill="white" opacity="0.9"/>
  </svg>`,
  className: '',
  iconSize: [28, 36],
  iconAnchor: [14, 36],
});

function ClickHandler({ onChange }: { onChange: (c: Coords) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Pans the map to coords whenever they change — used when Nominatim sets a location
function MapPanner({ coords }: { coords: Coords | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], Math.max(map.getZoom(), 15));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lng]);
  return null;
}

export default function LocationPicker({ value, onChange }: Props) {
  return (
    <div className="relative">
      <div className="h-52 rounded-lg overflow-hidden border border-gray-300 cursor-crosshair">
        <MapContainer
          center={[BAHIA_BLANCA.lat, BAHIA_BLANCA.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} />
          <MapPanner coords={value} />
          {value && <Marker position={[value.lat, value.lng]} icon={markerIcon} />}
        </MapContainer>
      </div>
      {value ? (
        <p className="mt-1 text-xs text-gray-500">
          Lat {value.lat.toFixed(5)}, Lng {value.lng.toFixed(5)}
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-400">Hacé click en el mapa para marcar la ubicación</p>
      )}
    </div>
  );
}
