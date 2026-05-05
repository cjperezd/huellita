import type { FastifyInstance } from 'fastify';
import type { ReportType, ReportStatus, PetSpecies, PetSize, CreateReportInput } from '@huellita/shared';
import { store } from '../store';
import { randomUUID } from 'crypto';

interface ListQuery {
  type?: ReportType;
  species?: PetSpecies;
  size?: PetSize;
  status?: ReportStatus;
  lat?: number;
  lng?: number;
  radius?: number; // km
  limit?: number;
  offset?: number;
}

interface IdParams {
  id: string;
}

interface PatchBody {
  status: ReportStatus;
}

// Haversine distance in km between two lat/lng points
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function reportRoutes(app: FastifyInstance) {
  // POST /reports
  app.post<{ Body: CreateReportInput }>('/reports', {
    schema: {
      body: {
        type: 'object',
        required: ['type', 'pet', 'location', 'contactName', 'contactPhone', 'description'],
        properties: {
          type: { type: 'string', enum: ['lost', 'found'] },
          pet: {
            type: 'object',
            required: ['species', 'color', 'size'],
            properties: {
              name: { type: 'string', nullable: true },
              species: { type: 'string', enum: ['dog', 'cat', 'bird', 'rabbit', 'other'] },
              breed: { type: 'string', nullable: true },
              color: { type: 'string' },
              size: { type: 'string', enum: ['small', 'medium', 'large'] },
              description: { type: 'string', nullable: true },
              photos: { type: 'array', items: { type: 'string' } },
              microchip: { type: 'string', nullable: true },
            },
          },
          location: {
            type: 'object',
            required: ['lat', 'lng', 'address', 'city', 'province'],
            properties: {
              lat: { type: 'number' },
              lng: { type: 'number' },
              address: { type: 'string' },
              neighborhood: { type: 'string', nullable: true },
              city: { type: 'string' },
              province: { type: 'string' },
            },
          },
          contactName: { type: 'string' },
          contactPhone: { type: 'string' },
          contactEmail: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const body = request.body;
    const now = new Date().toISOString();

    const report = store.create({
      id: randomUUID(),
      type: body.type,
      status: 'active',
      pet: { id: randomUUID(), ...body.pet, photos: body.pet.photos ?? [] },
      location: body.location,
      contactName: body.contactName,
      contactPhone: body.contactPhone,
      contactEmail: body.contactEmail ?? null,
      description: body.description,
      userId: (request.headers['x-user-id'] as string) ?? 'anonymous',
      createdAt: now,
      updatedAt: now,
      resolvedAt: null,
    });

    return reply.code(201).send(report);
  });

  // GET /reports
  app.get<{ Querystring: ListQuery }>('/reports', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['lost', 'found'] },
          species: { type: 'string', enum: ['dog', 'cat', 'bird', 'rabbit', 'other'] },
          size: { type: 'string', enum: ['small', 'medium', 'large'] },
          status: { type: 'string', enum: ['active', 'resolved', 'archived'] },
          lat: { type: 'number' },
          lng: { type: 'number' },
          radius: { type: 'number' },
          limit: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
          offset: { type: 'integer', default: 0, minimum: 0 },
        },
      },
    },
  }, async (request) => {
    const { type, species, size, status, lat, lng, radius, limit = 20, offset = 0 } = request.query;

    let results = store.getAll();

    if (type) results = results.filter((r) => r.type === type);
    if (species) results = results.filter((r) => r.pet.species === species);
    if (size) results = results.filter((r) => r.pet.size === size);
    if (status) results = results.filter((r) => r.status === status);
    else results = results.filter((r) => r.status === 'active');

    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      results = results.filter(
        (r) => distanceKm(lat, lng, r.location.lat, r.location.lng) <= radius,
      );
    }

    results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return {
      data: results.slice(offset, offset + limit),
      total: results.length,
    };
  });

  // GET /reports/:id
  app.get<{ Params: IdParams }>('/reports/:id', async (request, reply) => {
    const report = store.getById(request.params.id);
    if (!report) {
      return reply.code(404).send({ error: 'Reporte no encontrado', code: 'NOT_FOUND' });
    }
    return report;
  });

  // PATCH /reports/:id
  app.patch<{ Params: IdParams; Body: PatchBody }>('/reports/:id', {
    schema: {
      body: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['active', 'resolved', 'archived'] },
        },
      },
    },
  }, async (request, reply) => {
    const existing = store.getById(request.params.id);
    if (!existing) {
      return reply.code(404).send({ error: 'Reporte no encontrado', code: 'NOT_FOUND' });
    }

    const patch: Partial<typeof existing> = { status: request.body.status };
    if (request.body.status === 'resolved') {
      patch.resolvedAt = new Date().toISOString();
    }

    const updated = store.update(request.params.id, patch);
    return updated;
  });
}
