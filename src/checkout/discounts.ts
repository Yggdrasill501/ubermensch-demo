export const DISCOUNT_CODES: Record<string, number> = {
  HACK10: 10, // percent
};

export function applyDiscounts(totalCents: number, codes: string[]): number {
  let result = totalCents;
  for (const code of codes) {
    const percent = DISCOUNT_CODES[code] ?? 0;
    result = Math.round(result * (1 - percent / 100));
  }
  return result;
}
