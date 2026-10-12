import { DateTime } from 'luxon';
import i18n from './index';
import { fromCents } from 'app/utils/money';
import { resolveTimeZone } from 'app/utils/operatorTime';
import { Quantity, UnitSystem, UNIT_SYMBOLS, fromSi, toSi, unitOf } from './units';
import { activeCurrency, activeUnits } from './operatorFormat';

/** The currency of an operator that has not said (the server's default) */
export const DEFAULT_CURRENCY = 'AUD';
const NUMBER_LOCALE = 'en-AU';

export type Instant = DateTime | Date | string | number;

/** An instant as a luxon date in the operator's zone: a luxon date, a Date, an ISO string or seconds since the epoch */
export function inZone(value: Instant, timeZone?: string | null): DateTime {
  const zone = resolveTimeZone(timeZone);
  if (DateTime.isDateTime(value)) return value.setZone(zone);
  if (value instanceof Date) return DateTime.fromJSDate(value, { zone });
  if (typeof value === 'number') return DateTime.fromSeconds(value, { zone });
  return DateTime.fromISO(value, { zone });
}

/** "$12.50", "-$12.50" (cents in, the operator's currency out; AUD until the operator has one) */
export function formatMoney(cents?: number | null, currency: string = activeCurrency()): string {
  return new Intl.NumberFormat(NUMBER_LOCALE, { style: 'currency', currency }).format(
    fromCents(cents)
  );
}

/** "8 Oct 2027": day, English month abbreviation, year, never numeric (01/02 is ambiguous) */
export function formatDate(value: Instant, timeZone?: string | null): string {
  return inZone(value, timeZone).toFormat('d LLL yyyy', { locale: 'en' });
}

/** "14:05", or "2:05 pm" with `hour12`, as the clock at the operator shows it */
export function formatTime(
  value: Instant,
  timeZone?: string | null,
  { hour12 = false } = {}
): string {
  const date = inZone(value, timeZone);
  return hour12
    ? date.toFormat('h:mm a', { locale: 'en' }).toLowerCase()
    : date.toFormat('HH:mm', { locale: 'en' });
}

/** "8 Oct 2027, 14:05" */
export function formatDateTime(
  value: Instant,
  timeZone?: string | null,
  options?: { hour12?: boolean }
): string {
  return `${formatDate(value, timeZone)}, ${formatTime(value, timeZone, options)}`;
}

/** "in 10 minutes", "5 minutes ago" */
export function formatRelative(
  value: Instant,
  now: Instant = DateTime.now(),
  timeZone?: string | null
): string {
  const base = inZone(now, timeZone);
  return inZone(value, timeZone).toRelative({ base, locale: 'en' }) ?? '';
}

/** "10 minute boarding call": the minutes and the operator's word for a call */
export function formatCall(minutes: number): string {
  const call = String(i18n.t('terms:call', { count: 1 })).toLowerCase();
  return i18n.t('common:call.minutes', { minutes, call });
}

/**
 * "14k" for a height in feet (thousands, one decimal at most), "4267 m" in metres: an altitude as skydivers say it. The
 * height is SI (metres); the unit is the operator's.
 */
export function compactAltitude(altitudeM?: number | null, units?: UnitSystem | null): string {
  if (altitudeM === null || altitudeM === undefined || Number.isNaN(altitudeM)) return '';
  const unit = unitOf('altitude', units ?? activeUnits());
  if (unit === 'ft') return `${Math.round(fromSi('altitude', altitudeM, 'ft') / 100) / 10}k`;
  return `${Math.round(fromSi('altitude', altitudeM, unit))} ${UNIT_SYMBOLS[unit]}`;
}

/** A destination as a short label: the height for an altitude ("14k"), the name for a site, route or section; '' for none */
export function formatDestination(
  destination?: { name?: string | null; kind?: string | null; altitudeM?: number | null } | null,
  units?: UnitSystem | null
): string {
  if (!destination) return '';
  if (destination.kind === 'altitude' && typeof destination.altitudeM === 'number') {
    return compactAltitude(destination.altitudeM, units);
  }
  return destination.name ?? '';
}

const DIGITS: Record<Quantity, number> = {
  altitude: 0,
  depth: 1,
  distance: 2,
  mass: 1,
  area: 1,
  speed: 0,
  temperature: 0,
};

/**
 * "176.4 lb": an SI quantity in the operator's unit, with the digits the quantity needs. The operator's units are the
 * ones the app was given for it (`setOperatorFormat`), or the ones passed.
 */
export function formatQuantity(
  si: number | null | undefined,
  quantity: Quantity,
  units?: UnitSystem | null,
  options: { digits?: number } = {}
): string {
  if (si === null || si === undefined || Number.isNaN(si)) return '';
  const unit = unitOf(quantity, units ?? activeUnits());
  const text = new Intl.NumberFormat(NUMBER_LOCALE, {
    maximumFractionDigits: options.digits ?? DIGITS[quantity],
  }).format(fromSi(quantity, si, unit));
  return quantity === 'temperature'
    ? `${text}${UNIT_SYMBOLS[unit]}`
    : `${text} ${UNIT_SYMBOLS[unit]}`;
}

/** What a person typed in the operator's unit as SI: "176 lb" or "176" → 79.8; null when it is not a number */
export function parseQuantity(
  text: string | null | undefined,
  quantity: Quantity,
  units?: UnitSystem | null
): number | null {
  const unit = unitOf(quantity, units ?? activeUnits());
  const cleaned = (text ?? '').replace(',', '.').replace(/[^\d.+-]/g, '');
  const number = /\d/.test(cleaned) ? Number(cleaned) : NaN;
  if (Number.isNaN(number)) return null;
  return toSi(quantity, number, unit);
}
