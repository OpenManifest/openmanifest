import { DateTime } from 'luxon';
import i18n from './index';
import { fromCents } from 'app/utils/money';
import { resolveTimeZone } from 'app/utils/operatorTime';

/** What the currency is until the operator has one (P7.12) */
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
export function formatMoney(cents?: number | null, currency: string = DEFAULT_CURRENCY): string {
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

/** The destination's name; P7.8 adds kinds, coordinates and the per-load scope */
export function formatDestination(destination?: { name?: string | null } | null): string {
  return destination?.name ?? '';
}

/** "240 kg": a quantity with its unit symbol; P7.12 adds unit conversion and the operator's units */
export function formatQuantity(value?: number | null, unit?: string | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  const text = new Intl.NumberFormat(NUMBER_LOCALE, { maximumFractionDigits: 1 }).format(value);
  return unit ? `${text} ${unit}` : text;
}
