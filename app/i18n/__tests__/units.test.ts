import {
  DEFAULT_UNITS,
  Quantity,
  UNIT_CHOICES,
  UNIT_SYMBOLS,
  convert,
  fromSi,
  toSi,
  unitOf,
} from '../units';

// [quantity, unit, a value in that unit, the SI value]: the same pairs as the server's spec/models/units_spec.rb
const CASES: [Quantity, string, number, number][] = [
  ['altitude', 'ft', 14000, 4267.2],
  ['altitude', 'm', 4267.2, 4267.2],
  ['depth', 'ft', 100, 30.48],
  ['depth', 'm', 18, 18],
  ['distance', 'km', 2.5, 2500],
  ['distance', 'nmi', 1, 1852],
  ['distance', 'mi', 1, 1609.344],
  ['distance', 'm', 750, 750],
  ['mass', 'kg', 80, 80],
  ['mass', 'lb', 176.37, 80.0001],
  ['area', 'ft2', 150, 13.935456],
  ['area', 'm2', 14, 14],
  ['speed', 'kn', 10, 5.14444],
  ['speed', 'kmh', 36, 10],
  ['speed', 'mph', 10, 4.4704],
  ['speed', 'mps', 7, 7],
  ['temperature', 'c', 21, 21],
  ['temperature', 'f', 70, 21.1111],
  ['temperature', 'f', 32, 0],
];

describe('units', () => {
  it.each(CASES)('turns %s in %s (%d) into %d SI and back', (quantity, unit, value, si) => {
    expect(toSi(quantity, value, unit)).toBeCloseTo(si, 3);
    expect(fromSi(quantity, si, unit)).toBeCloseTo(value, 2);
  });

  it('converts between two display units', () => {
    expect(convert('altitude', 14000, 'ft', 'm')).toBeCloseTo(4267.2, 2);
    expect(convert('speed', 10, 'kn', 'kmh')).toBeCloseTo(18.52, 2);
    expect(convert('temperature', 100, 'c', 'f')).toBeCloseTo(212, 3);
  });

  it('refuses a unit the quantity does not have', () => {
    expect(() => toSi('mass', 1, 'ft')).toThrow(RangeError);
    expect(() => fromSi('temperature', 1, 'k')).toThrow(RangeError);
  });

  it('has a symbol for every unit it offers, and metric defaults', () => {
    Object.values(UNIT_CHOICES)
      .flat()
      .forEach((unit) => expect(UNIT_SYMBOLS[unit]).toBeTruthy());
    expect(unitOf('mass', undefined)).toBe(DEFAULT_UNITS.mass);
    expect(unitOf('mass', { mass: 'lb' })).toBe('lb');
    expect(unitOf('mass', { mass: 'stone' })).toBe('kg');
  });
});
