export function formatCurrencyCents(cents: number, currency = "BRL", locale = "pt-BR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(cents / 100);
}
