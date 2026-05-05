import type { ReportType, PetSpecies, PetSize } from '@huellita/shared';

export const MARKER_COLORS: Record<ReportType, string> = {
  lost: '#ef4444',
  found: '#22c55e',
  sighting: '#eab308',
};

export const TYPE_LABELS: Record<ReportType, string> = {
  lost: 'Perdido',
  found: 'Encontrado',
  sighting: 'Avistamiento',
};

export const SPECIES_LABELS: Record<PetSpecies, string> = {
  dog: 'Perro',
  cat: 'Gato',
  bird: 'Pájaro',
  rabbit: 'Conejo',
  other: 'Otro',
};

export const SIZE_LABELS: Record<PetSize, string> = {
  small: 'Chico',
  medium: 'Mediano',
  large: 'Grande',
};
