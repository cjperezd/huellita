export const PET_SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'other'] as const;
export const PET_SIZES = ['small', 'medium', 'large'] as const;

export type PetSpecies = (typeof PET_SPECIES)[number];
export type PetSize = (typeof PET_SIZES)[number];

export interface Pet {
  id: string;
  name: string | null;
  species: PetSpecies;
  breed: string | null;
  color: string;
  size: PetSize;
  description: string | null;
  photos: string[];
  microchip: string | null;
}
