import type { Pet } from './pet';

export type ReportType = 'lost' | 'found';
export type ReportStatus = 'active' | 'resolved' | 'archived';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  neighborhood: string | null;
  city: string;
  province: string;
}

export interface Report {
  id: string;
  type: ReportType;
  status: ReportStatus;
  pet: Pet;
  location: Location;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  description: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface CreateReportInput {
  type: ReportType;
  pet: Omit<Pet, 'id'>;
  location: Location;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  description: string;
}
