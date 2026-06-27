export function toISODate(value: Date | string): string {
  return new Date(value).toISOString();
}

export function isFutureDate(value: Date | string, now: Date = new Date()): boolean {
  return new Date(value).getTime() > now.getTime();
}
