import type { Pet } from './pet';

export const REPORT_TYPES = ['lost', 'found', 'sighting'] as const;
export const REPORT_STATUSES = ['active', 'resolved', 'archived'] as const;

export type ReportType = (typeof REPORT_TYPES)[number];
export type ReportStatus = (typeof REPORT_STATUSES)[number];

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
