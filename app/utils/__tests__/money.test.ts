import { formatCents, fromCents, toCents } from '../money';

describe('money', () => {
  test('toCents rounds to the cent', () => {
    expect(toCents(12.5)).toBe(1250);
    expect(toCents(0.1 + 0.2)).toBe(30);
    expect(toCents(19.99)).toBe(1999);
    expect(toCents(0)).toBe(0);
  });

  test('toCents treats a missing or invalid amount as zero', () => {
    expect(toCents(undefined)).toBe(0);
    expect(toCents(null)).toBe(0);
    expect(toCents(Number.NaN)).toBe(0);
  });

  test('fromCents returns currency units', () => {
    expect(fromCents(1250)).toBe(12.5);
    expect(fromCents(null)).toBe(0);
  });

  test('formatCents always shows two decimals', () => {
    expect(formatCents(1250)).toBe('$12.50');
    expect(formatCents(5)).toBe('$0.05');
    expect(formatCents(0)).toBe('$0.00');
    expect(formatCents(undefined)).toBe('$0.00');
    expect(formatCents(292000)).toBe('$2920.00');
  });

  test('formatCents puts the sign before the currency symbol', () => {
    expect(formatCents(-1250)).toBe('-$12.50');
    expect(formatCents(-5)).toBe('-$0.05');
  });
});
