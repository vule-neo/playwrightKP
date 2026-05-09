export type ParsedPrice = { value: number; currency: 'EUR' | 'DIN' };

export function parsePrice(priceText: string): ParsedPrice | null {
  const cleaned = priceText.trim();

  if (!cleaned || cleaned.toLowerCase().includes('dogovoru')) {
    return null;
  }

  const isEur = cleaned.includes('€');
  const digits = cleaned.replace(/\./g, '').replace(/[^\d]/g, '');
  const value = parseInt(digits, 10);

  if (isNaN(value) || digits.length === 0) return null;

  return { value, currency: isEur ? 'EUR' : 'DIN' };
}

// Approximate rate — used only for sort-order validation, not financial calculations
export function toEur(price: ParsedPrice, eurToDinRate = 117): number {
  return price.currency === 'EUR' ? price.value : price.value / eurToDinRate;
}
