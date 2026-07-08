export function parseLimit(value: unknown, fallback = 20, max = 100): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(max, Math.floor(parsed)));
}

export function encodeCursor(date: Date, id: string): string {
  return Buffer.from(JSON.stringify({ date: date.toISOString(), id })).toString("base64url");
}

export function decodeCursor(cursor: unknown): { date: Date; id: string } | null {
  if (!cursor) return null;
  try {
    const parsed = JSON.parse(Buffer.from(String(cursor), "base64url").toString("utf8")) as { date?: string; id?: string };
    if (!parsed.date || !parsed.id) return null;
    const date = new Date(parsed.date);
    return Number.isNaN(date.getTime()) ? null : { date, id: parsed.id };
  } catch {
    return null;
  }
}
