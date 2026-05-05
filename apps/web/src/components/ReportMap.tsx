'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import type { Report, ReportType } from '@huellita/shared';
import { mockReports } from '@/lib/mock-data';
import { MARKER_COLORS, TYPE_LABELS, SPECIES_LABELS } from '@/lib/report-utils';

function pinIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="28" height="36">
    <path d="M12 0C7.16 0 3.2 3.96 3.2 8.8C3.2 15.4 12 28 12 28S20.8 15.4 20.8 8.8C20.8 3.96 16.84 0 12 0Z"
      fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="12" cy="9" r="4" fill="white" opacity="0.9"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -38],
  });
}

const TYPE_BADGE_COLORS: Record<ReportType, string> = {
  lost: 'bg-red-100 text-red-700',
  found: 'bg-green-100 text-green-700',
  sighting: 'bg-yellow-100 text-yellow-700',
};

export default function ReportMap() {
  return (
    <MapContainer
      center={[-34.6037, -58.3816]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {mockReports.map((report) => (
        <Marker
          key={report.id}
          position={[report.location.lat, report.location.lng]}
          icon={pinIcon(MARKER_COLORS[report.type])}
        >
          <Popup minWidth={180}>
            <ReportPopup report={report} />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function ReportPopup({ report }: { report: Report }) {
  return (
    <div style={{ width: 200 }}>
      {report.pet.photos[0] && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={report.pet.photos[0]}
          alt={report.pet.name ?? report.pet.species}
          style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 4, marginBottom: 8 }}
        />
      )}
      <span
        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_BADGE_COLORS[report.type]}`}
      >
        {TYPE_LABELS[report.type]}
      </span>
      <p className="font-semibold text-sm mt-1 text-gray-800">
        {report.pet.name
          ? `${report.pet.name} · ${SPECIES_LABELS[report.pet.species]}`
          : SPECIES_LABELS[report.pet.species]}
      </p>
      {report.location.neighborhood && (
        <p className="text-xs text-gray-500">{report.location.neighborhood}</p>
      )}
      <p className="text-xs text-gray-600 mt-1 leading-snug line-clamp-2">{report.description}</p>
      <Link
        href={`/reporte/${report.id}`}
        className="block mt-2 text-xs font-medium text-blue-600 hover:underline"
      >
        Ver detalle →
      </Link>
    </div>
  );
}
