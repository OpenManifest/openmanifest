/**
 * Quantities are SI in the API (metres, kilograms, metres per second, degrees Celsius) and shown in the operator's units
 * (`operator.units`): the same pairs as the server's `Units` module (GENERALISATION §12).
 */
export type Quantity =
  'altitude' | 'depth' | 'distance' | 'mass' | 'area' | 'speed' | 'temperature';

/** The unit the operator shows each quantity in: `{ altitude: 'ft', mass: 'kg', ... }` */
export type UnitSystem = Partial<Record<Quantity, string>>;

const FOOT = 0.3048;
const NAUTICAL_MILE = 1852;
const MILE = 1609.344;
const POUND = 0.45359237;

/** SI units in one unit of each (temperature is not a ratio, see below) */
const FACTORS: Record<Exclude<Quantity, 'temperature'>, Record<string, number>> = {
  altitude: { m: 1, ft: FOOT },
  depth: { m: 1, ft: FOOT },
  distance: { m: 1, km: 1000, nmi: NAUTICAL_MILE, mi: MILE },
  mass: { kg: 1, lb: POUND },
  area: { m2: 1, ft2: FOOT * FOOT },
  speed: { mps: 1, kn: NAUTICAL_MILE / 3600, kmh: 1 / 3.6, mph: MILE / 3600 },
};

const TEMPERATURE = ['c', 'f'];

/** What each quantity can be shown in, the SI unit of speed (`mps`) left out */
export const UNIT_CHOICES: Record<Quantity, string[]> = {
  altitude: ['ft', 'm'],
  depth: ['ft', 'm'],
  distance: ['km', 'nmi', 'mi', 'm'],
  mass: ['kg', 'lb'],
  area: ['ft2', 'm2'],
  speed: ['kn', 'kmh', 'mph'],
  temperature: TEMPERATURE,
};

/** What an operator without units shows: metric */
export const DEFAULT_UNITS: Required<UnitSystem> = {
  altitude: 'm',
  depth: 'm',
  distance: 'km',
  mass: 'kg',
  area: 'm2',
  speed: 'kmh',
  temperature: 'c',
};

/** How a unit is written after a number */
export const UNIT_SYMBOLS: Record<string, string> = {
  m: 'm',
  ft: 'ft',
  km: 'km',
  nmi: 'nmi',
  mi: 'mi',
  kg: 'kg',
  lb: 'lb',
  m2: 'm²',
  ft2: 'ft²',
  mps: 'm/s',
  kn: 'kn',
  kmh: 'km/h',
  mph: 'mph',
  c: '°C',
  f: '°F',
};

/** The unit the system shows a quantity in (metric when it does not say) */
export function unitOf(quantity: Quantity, units?: UnitSystem | null): string {
  const chosen = units?.[quantity];
  return chosen && UNIT_SYMBOLS[chosen] ? chosen : DEFAULT_UNITS[quantity];
}

function factor(quantity: Exclude<Quantity, 'temperature'>, unit: string): number {
  const found = FACTORS[quantity][unit];
  if (found === undefined) throw new RangeError(`${unit} is not a unit of ${quantity}`);
  return found;
}

/** A value in `unit` as SI */
export function toSi(quantity: Quantity, value: number, unit: string): number {
  if (quantity === 'temperature') {
    if (unit === 'c') return value;
    if (unit === 'f') return ((value - 32) * 5) / 9;
    throw new RangeError(`${unit} is not a unit of temperature`);
  }
  return value * factor(quantity, unit);
}

/** An SI value in `unit` */
export function fromSi(quantity: Quantity, value: number, unit: string): number {
  if (quantity === 'temperature') {
    if (unit === 'c') return value;
    if (unit === 'f') return (value * 9) / 5 + 32;
    throw new RangeError(`${unit} is not a unit of temperature`);
  }
  return value / factor(quantity, unit);
}

/** A value from one display unit to another */
export function convert(quantity: Quantity, value: number, from: string, to: string): number {
  return fromSi(quantity, toSi(quantity, value, from), to);
}
