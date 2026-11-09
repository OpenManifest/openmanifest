import { DateTime } from 'luxon';
import { resolveTimeZone } from 'app/utils/operatorTime';

/**
 * The values of the date and time fields. Both fields speak seconds since the epoch, as the forms do; these helpers turn
 * them into the strings and the clock readings the pickers show, and back.
 */

/** The calendar date (yyyy-MM-dd) of an instant on this device, or `null` when there is none */
export function isoDateOf(seconds?: number | null): string | null {
  if (!seconds) return null;
  return DateTime.fromSeconds(seconds).toISODate();
}

/**
 * The instant of a calendar date (yyyy-MM-dd): its midday on this device, so that the date stays the same wherever the
 * value is read (an ISO string in UTC, a zone up to twelve hours away). `null` for an empty or broken date.
 */
export function secondsOfIsoDate(iso?: string | null): number | null {
  if (!iso) return null;
  const date = DateTime.fromISO(iso);
  if (!date.isValid) return null;
  return date.set({ hour: 12, minute: 0, second: 0, millisecond: 0 }).toSeconds();
}

/** The time of day (HH:mm, 24 hours) of an instant on the operator's clock, or `null` when there is none */
export function clockOf(seconds?: number | null, timeZone?: string | null): string | null {
  if (!seconds) return null;
  return DateTime.fromSeconds(seconds, { zone: resolveTimeZone(timeZone) }).toFormat('HH:mm');
}

/** The instant that is a time of day (HH:mm), today on the operator's clock; `null` for an empty or broken time */
export function secondsOfClock(
  clock?: string | null,
  timeZone?: string | null,
  now: DateTime = DateTime.now()
): number | null {
  const match = /^(\d{1,2}):(\d{2})/.exec(clock ?? '');
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return now
    .setZone(resolveTimeZone(timeZone))
    .set({ hour, minute, second: 0, millisecond: 0 })
    .toSeconds();
}

/**
 * A device `Date` that reads, on this device's clock, the time the operator's clock shows at `seconds` (now when there is
 * none): the native pickers show the device's clock, and the operator may be in another zone.
 */
export function deviceDateShowing(
  seconds?: number | null,
  timeZone?: string | null,
  now: DateTime = DateTime.now()
): Date {
  const shown = (seconds ? DateTime.fromSeconds(seconds) : now).setZone(resolveTimeZone(timeZone));
  return new Date(shown.year, shown.month - 1, shown.day, shown.hour, shown.minute);
}
