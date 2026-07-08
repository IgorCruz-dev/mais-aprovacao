export function formatScientificText(value: string): string {
  return String(value ?? "")
    .replace(/(\d+(?:[,.]\d+)?)\s*x\s*10\^(-?\d+)/gi, "$1 × 10^{$2}")
    .replace(/(\d+(?:[,.]\d+)?)\s*e(-?\d+)/gi, "$1 × 10^{$2}")
}
