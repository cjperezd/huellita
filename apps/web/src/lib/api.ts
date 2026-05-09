import type { Report } from '@huellita/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface ListResponse {
  data: Report[];
  total: number;
}

export async function fetchReports(opts?: { signal?: AbortSignal }): Promise<Report[]> {
  const res = await fetch(`${API_URL}/reports`, {
    cache: 'no-store',
    signal: opts?.signal,
  });
  if (!res.ok) throw new Error(`Error al cargar reportes (${res.status})`);
  const json = (await res.json()) as ListResponse;
  return json.data;
}

export async function fetchReport(id: string): Promise<Report | null> {
  const res = await fetch(`${API_URL}/reports/${id}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Error al cargar reporte (${res.status})`);
  return (await res.json()) as Report;
}
