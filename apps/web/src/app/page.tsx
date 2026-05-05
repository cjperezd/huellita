import dynamic from 'next/dynamic';

const ReportMap = dynamic(() => import('@/components/ReportMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      <p className="text-sm text-gray-400">Cargando mapa...</p>
    </div>
  ),
});

export default function HomePage() {
  return (
    <div className="h-full w-full overflow-hidden">
      <ReportMap />
    </div>
  );
}
