import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getMockReport, mockReports } from '@/lib/mock-data';
import { TYPE_LABELS, SPECIES_LABELS, SIZE_LABELS, MARKER_COLORS } from '@/lib/report-utils';
import ShareButtons from '@/components/ShareButtons';

const MiniMap = dynamic(() => import('@/components/MiniMap'), {
  ssr: false,
  loading: () => <div className="h-52 rounded-xl bg-gray-100 animate-pulse" />,
});

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const report = getMockReport(params.id) ?? mockReports[0];
  if (!report) return { title: 'Huellita — Mascotas Perdidas' };

  const petName = report.pet.name ?? SPECIES_LABELS[report.pet.species];
  const zone = report.location.neighborhood ?? report.location.city;
  const title = `${TYPE_LABELS[report.type]}: ${petName} en ${zone}`;
  const description = report.description.slice(0, 155);
  const image = report.pet.photos[0];

  return {
    title: `${title} — Huellita`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(image && { images: [{ url: image, width: 400, height: 300, alt: petName }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default function ReportePage({ params }: Props) {
  // During development without DB, fall back to first mock report for any unknown id
  const report = getMockReport(params.id) ?? mockReports[0];
  if (!report) notFound();

  const petName = report.pet.name ?? SPECIES_LABELS[report.pet.species];
  const zone = report.location.neighborhood ?? report.location.city;
  const color = MARKER_COLORS[report.type];
  const typeLabel = TYPE_LABELS[report.type];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Volver al mapa
        </Link>

        {/* Photo */}
        {report.pet.photos[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={report.pet.photos[0]}
            alt={petName}
            className="w-full h-64 object-cover rounded-2xl"
          />
        ) : (
          <div className="w-full h-64 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
            </svg>
          </div>
        )}

        {/* Header */}
        <div>
          <span
            className="inline-block text-xs font-bold px-3 py-1 rounded-full text-white mb-2"
            style={{ backgroundColor: color }}
          >
            {typeLabel}
          </span>
          <h1 className="text-2xl font-bold text-gray-900">{petName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {SPECIES_LABELS[report.pet.species]} · {SIZE_LABELS[report.pet.size]}
            {report.pet.breed ? ` · ${report.pet.breed}` : ''}
          </p>
        </div>

        {/* Description */}
        <div className="bg-gray-50 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Descripción</h2>
          <p className="text-sm text-gray-800 leading-relaxed">{report.description}</p>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Última ubicación conocida
          </h2>
          <p className="text-sm text-gray-700 mb-3">
            {report.location.address}
            {report.location.neighborhood ? `, ${report.location.neighborhood}` : ''},{' '}
            {report.location.city}
          </p>
          <MiniMap lat={report.location.lat} lng={report.location.lng} type={report.type} />
        </div>

        {/* Contact */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Contacto</h2>
          <p className="text-sm font-medium text-gray-900">{report.contactName}</p>
          <a
            href={`tel:${report.contactPhone}`}
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" />
            </svg>
            {report.contactPhone}
          </a>
          {report.contactEmail && (
            <a
              href={`mailto:${report.contactEmail}`}
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              {report.contactEmail}
            </a>
          )}
        </div>

        {/* Share */}
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Compartir
          </h2>
          <ShareButtons
            title={`${typeLabel}: ${petName} en ${zone}`}
            reportId={report.id}
          />
        </div>

        {/* Date */}
        <p className="text-xs text-gray-400 pb-4">
          Publicado el{' '}
          {new Date(report.createdAt).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>
    </div>
  );
}
