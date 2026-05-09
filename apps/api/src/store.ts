import { Pool } from 'pg';
import type { Report, ReportStatus, PetSpecies, PetSize, ReportType } from '@huellita/shared';

const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
  throw new Error('DATABASE_URL no está definida — no se puede inicializar el pool de Postgres.');
}

// Supabase requiere SSL en conexiones directas. El cert es de una CA privada
// que Node no conoce, así que aceptamos sin verificar — la conexión sigue cifrada.
const useSsl = /supabase\.co|sslmode=require/.test(connectionString);

const pool = new Pool({
  connectionString,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

interface ReportRow {
  id: string;
  type: ReportType;
  status: ReportStatus;
  species: PetSpecies;
  size: PetSize;
  description: string;
  pet_id: string;
  pet_name: string | null;
  pet_breed: string | null;
  pet_color: string;
  pet_description: string | null;
  pet_photos: string[];
  pet_microchip: string | null;
  lat: number;
  lng: number;
  address: string;
  neighborhood: string | null;
  city: string;
  province: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  resolved_at: Date | null;
}

const SELECT_COLUMNS = `
  id, type, status, species, size, description,
  pet_id, pet_name, pet_breed, pet_color, pet_description, pet_photos, pet_microchip,
  ST_Y(location) AS lat, ST_X(location) AS lng,
  address, neighborhood, city, province,
  contact_name, contact_phone, contact_email, user_id,
  created_at, updated_at, resolved_at
`;

function rowToReport(r: ReportRow): Report {
  return {
    id: r.id,
    type: r.type,
    status: r.status,
    pet: {
      id: r.pet_id,
      name: r.pet_name,
      species: r.species,
      breed: r.pet_breed,
      color: r.pet_color,
      size: r.size,
      description: r.pet_description,
      photos: r.pet_photos ?? [],
      microchip: r.pet_microchip,
    },
    location: {
      lat: Number(r.lat),
      lng: Number(r.lng),
      address: r.address,
      neighborhood: r.neighborhood,
      city: r.city,
      province: r.province,
    },
    contactName: r.contact_name,
    contactPhone: r.contact_phone,
    contactEmail: r.contact_email,
    description: r.description,
    userId: r.user_id,
    createdAt: r.created_at.toISOString(),
    updatedAt: r.updated_at.toISOString(),
    resolvedAt: r.resolved_at?.toISOString() ?? null,
  };
}

export const store = {
  async getAll(): Promise<Report[]> {
    const { rows } = await pool.query<ReportRow>(
      `SELECT ${SELECT_COLUMNS} FROM reports ORDER BY created_at DESC`,
    );
    return rows.map(rowToReport);
  },

  async getById(id: string): Promise<Report | undefined> {
    const { rows } = await pool.query<ReportRow>(
      `SELECT ${SELECT_COLUMNS} FROM reports WHERE id = $1`,
      [id],
    );
    return rows[0] ? rowToReport(rows[0]) : undefined;
  },

  async create(report: Report): Promise<Report> {
    const { rows } = await pool.query<ReportRow>(
      `INSERT INTO reports (
         id, type, status, species, size, description,
         pet_id, pet_name, pet_breed, pet_color, pet_description, pet_photos, pet_microchip,
         location,
         address, neighborhood, city, province,
         contact_name, contact_phone, contact_email, user_id,
         created_at, updated_at, resolved_at
       ) VALUES (
         $1, $2::report_type, $3::report_status, $4::pet_species, $5::pet_size, $6,
         $7, $8, $9, $10, $11, $12, $13,
         ST_SetSRID(ST_MakePoint($14, $15), 4326),
         $16, $17, $18, $19,
         $20, $21, $22, $23,
         $24, $25, $26
       )
       RETURNING ${SELECT_COLUMNS}`,
      [
        report.id,
        report.type,
        report.status,
        report.pet.species,
        report.pet.size,
        report.description,
        report.pet.id,
        report.pet.name,
        report.pet.breed,
        report.pet.color,
        report.pet.description,
        report.pet.photos,
        report.pet.microchip,
        report.location.lng,
        report.location.lat,
        report.location.address,
        report.location.neighborhood,
        report.location.city,
        report.location.province,
        report.contactName,
        report.contactPhone,
        report.contactEmail,
        report.userId,
        report.createdAt,
        report.updatedAt,
        report.resolvedAt,
      ],
    );
    return rowToReport(rows[0]!);
  },

  async update(id: string, patch: Partial<Report>): Promise<Report | undefined> {
    // Solo soportamos los campos que las routes parchean: status y resolvedAt.
    // updated_at lo actualiza el trigger reports_set_updated_at.
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (patch.status !== undefined) {
      sets.push(`status = $${i++}::report_status`);
      values.push(patch.status);
    }
    if (patch.resolvedAt !== undefined) {
      sets.push(`resolved_at = $${i++}`);
      values.push(patch.resolvedAt);
    }

    if (sets.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const { rows } = await pool.query<ReportRow>(
      `UPDATE reports SET ${sets.join(', ')} WHERE id = $${i} RETURNING ${SELECT_COLUMNS}`,
      values,
    );
    return rows[0] ? rowToReport(rows[0]) : undefined;
  },
};
