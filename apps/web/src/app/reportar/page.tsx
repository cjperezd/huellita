import dynamic from 'next/dynamic';

const ReportForm = dynamic(() => import('@/components/ReportForm'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-100 rounded-xl" />
      ))}
    </div>
  ),
});

export default function ReportarPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nuevo reporte</h1>
          <p className="mt-1 text-sm text-gray-500">
            Completá los datos para publicar el aviso y ayudar a encontrar la mascota.
          </p>
        </div>
        <ReportForm />
      </div>
    </div>
  );
}
