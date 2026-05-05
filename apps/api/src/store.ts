import type { Report } from '@huellita/shared';

// Temporary in-memory store — replace with DB queries when Postgres is wired up
const reports = new Map<string, Report>();

export const store = {
  getAll(): Report[] {
    return Array.from(reports.values());
  },

  getById(id: string): Report | undefined {
    return reports.get(id);
  },

  create(report: Report): Report {
    reports.set(report.id, report);
    return report;
  },

  update(id: string, patch: Partial<Report>): Report | undefined {
    const existing = reports.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    reports.set(id, updated);
    return updated;
  },
};
