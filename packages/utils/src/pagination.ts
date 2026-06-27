export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export function normalizeLimit(limit?: number): number {
  if (typeof limit !== "number" || Number.isNaN(limit)) return DEFAULT_PAGE_LIMIT;
  return Math.min(Math.max(Math.trunc(limit), 1), MAX_PAGE_LIMIT);
}
