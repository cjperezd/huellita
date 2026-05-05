export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
export type PetSize = 'small' | 'medium' | 'large';

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
