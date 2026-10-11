/**
 * Money is exchanged with the API as integer cents (`*Cents` fields). Forms still let people type whole or
 * fractional currency units, and these helpers convert at the edge.
 */

/** Cents for an amount typed in currency units, rounded to the cent (12.5 -> 1250) */
export function toCents(units?: number | null): number {
  if (units === null || units === undefined || Number.isNaN(units)) {
    return 0;
  }
  return Math.round(units * 100);
}

/** Currency units for an amount in cents (1250 -> 12.5) */
export function fromCents(cents?: number | null): number {
  return (cents || 0) / 100;
}

/** "$12.50", or "-$12.50" for negative amounts */
export function formatCents(cents?: number | null): string {
  const value = cents || 0;
  const absolute = Math.abs(value);
  const whole = Math.floor(absolute / 100);
  const fraction = String(absolute % 100).padStart(2, '0');
  return `${value < 0 ? '-' : ''}$${whole}.${fraction}`;
}
