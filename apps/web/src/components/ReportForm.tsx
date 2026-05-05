'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { REPORT_TYPES, PET_SPECIES, PET_SIZES } from '@huellita/shared';
import { TYPE_LABELS, SPECIES_LABELS, SIZE_LABELS } from '@/lib/report-utils';

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-52 rounded-lg bg-gray-100 animate-pulse" />,
});

const schema = z.object({
  type: z.enum(REPORT_TYPES as unknown as [string, ...string[]]),
  species: z.enum(PET_SPECIES as unknown as [string, ...string[]]),
  size: z.enum(PET_SIZES as unknown as [string, ...string[]]),
  description: z.string().min(10, 'Ingresá al menos 10 caracteres'),
  zone_text: z.string().min(3, 'Ingresá el barrio o zona'),
  contactName: z.string().min(2, 'Ingresá tu nombre'),
  contactPhone: z.string().min(6, 'Ingresá un teléfono de contacto'),
  lat: z.number({ message: 'Seleccioná la ubicación en el mapa' }),
  lng: z.number({ message: 'Seleccioná la ubicación en el mapa' }),
});

type FormValues = z.infer<typeof schema>;

const TYPE_COLORS = {
  lost: { ring: 'ring-red-500 bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  found: { ring: 'ring-green-500 bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  sighting: { ring: 'ring-yellow-500 bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
} as const;

export default function ReportForm() {
  const router = useRouter();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'lost' },
  });

  const selectedType = watch('type') as keyof typeof TYPE_COLORS;
  const latValue = watch('lat');
  const lngValue = watch('lng');

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  async function onSubmit(data: FormValues) {
    setSubmitError(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

    try {
      const body = {
        type: data.type,
        pet: {
          name: null,
          species: data.species,
          breed: null,
          color: 'desconocido',
          size: data.size,
          description: data.description,
          photos: [],
          microchip: null,
        },
        location: {
          lat: data.lat,
          lng: data.lng,
          address: data.zone_text,
          neighborhood: data.zone_text,
          city: 'Buenos Aires',
          province: 'Buenos Aires',
        },
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        description: data.description,
      };

      const res = await fetch(`${apiUrl}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? 'Error al crear el reporte');
      }

      const created = (await res.json()) as { id: string };
      router.push(`/reporte/${created.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error inesperado');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Tipo */}
      <fieldset>
        <legend className="text-sm font-semibold text-gray-700 mb-3">¿Qué querés reportar?</legend>
        <div className="grid grid-cols-3 gap-3">
          {REPORT_TYPES.map((t) => {
            const colors = TYPE_COLORS[t as keyof typeof TYPE_COLORS];
            const isSelected = selectedType === t;
            return (
              <label
                key={t}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? `border-current ring-2 ${colors.ring} ${colors.text}`
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  value={t}
                  {...register('type')}
                  className="sr-only"
                />
                <span className={`w-3 h-3 rounded-full ${isSelected ? colors.dot : 'bg-gray-300'}`} />
                <span className="text-sm font-medium">{TYPE_LABELS[t]}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Especie y tamaño */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Especie</label>
          <select
            {...register('species')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccioná</option>
            {PET_SPECIES.map((s) => (
              <option key={s} value={s}>{SPECIES_LABELS[s]}</option>
            ))}
          </select>
          {errors.species && <p className="mt-1 text-xs text-red-600">{errors.species.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tamaño</label>
          <select
            {...register('size')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccioná</option>
            {PET_SIZES.map((s) => (
              <option key={s} value={s}>{SIZE_LABELS[s]}</option>
            ))}
          </select>
          {errors.size && <p className="mt-1 text-xs text-red-600">{errors.size.message}</p>}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Descripción
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Color del pelaje, características distintivas, collar, dónde y cuándo fue visto..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Foto */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Foto <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <div
          className="relative flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
          style={{ height: photoPreview ? 'auto' : 120 }}
          onClick={() => fileRef.current?.click()}
        >
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoPreview} alt="Preview" className="w-full max-h-64 object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400 py-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 3 3 0 0 1 3.076 4.846A3 3 0 0 1 17.25 19.5H6.75Z" />
              </svg>
              <span className="text-sm">Subir foto</span>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
          />
        </div>
        {photoPreview && (
          <button
            type="button"
            onClick={() => { setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
            className="mt-1 text-xs text-red-500 hover:underline"
          >
            Eliminar foto
          </button>
        )}
      </div>

      {/* Zona */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Barrio / zona
        </label>
        <input
          {...register('zone_text')}
          type="text"
          placeholder="Ej: Palermo, Villa Crespo, Recoleta..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.zone_text && (
          <p className="mt-1 text-xs text-red-600">{errors.zone_text.message}</p>
        )}
      </div>

      {/* Ubicación */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Ubicación exacta
        </label>
        <LocationPicker
          value={latValue !== undefined && lngValue !== undefined ? { lat: latValue, lng: lngValue } : null}
          onChange={({ lat, lng }) => {
            setValue('lat', lat, { shouldValidate: true });
            setValue('lng', lng, { shouldValidate: true });
          }}
        />
        {errors.lat && (
          <p className="mt-1 text-xs text-red-600">{errors.lat.message}</p>
        )}
      </div>

      {/* Contacto */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tu nombre</label>
          <input
            {...register('contactName')}
            type="text"
            placeholder="Nombre y apellido"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.contactName && (
            <p className="mt-1 text-xs text-red-600">{errors.contactName.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Teléfono</label>
          <input
            {...register('contactPhone')}
            type="tel"
            placeholder="+54 9 11..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.contactPhone && (
            <p className="mt-1 text-xs text-red-600">{errors.contactPhone.message}</p>
          )}
        </div>
      </div>

      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
      >
        {isSubmitting ? 'Publicando...' : 'Publicar reporte'}
      </button>
    </form>
  );
}
