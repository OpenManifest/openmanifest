import { DateTime, IANAZone } from 'luxon';

/** What the server uses for a dropzone without a time zone */
export const DEFAULT_TIME_ZONE = 'Australia/Brisbane';

/**
 * The zone a dropzone's days and times are in. Before the dropzone has loaded (or for a name the device does not know)
 * the device's zone, which is right for anybody at the dropzone and a harmless guess for a moment otherwise.
 */
export function resolveTimeZone(timeZone?: string | null): string {
  if (timeZone && IANAZone.isValidZone(timeZone)) {
    return timeZone;
  }
  return DateTime.local().zoneName || DEFAULT_TIME_ZONE;
}

/** Today's date (yyyy-MM-dd) where the dropzone is, whatever the zone of the device is */
export function todayInZone(timeZone?: string | null, now: DateTime = DateTime.now()): string {
  return now.setZone(resolveTimeZone(timeZone)).toISODate() as string;
}

/** The date (yyyy-MM-dd) an instant falls on where the dropzone is */
export function dateInZone(iso: string, timeZone?: string | null): string {
  return DateTime.fromISO(iso, { zone: resolveTimeZone(timeZone) }).toISODate() as string;
}

export function isTodayInZone(
  iso: string,
  timeZone?: string | null,
  now: DateTime = DateTime.now()
): boolean {
  return dateInZone(iso, timeZone) === todayInZone(timeZone, now);
}

/** A time of day (hh:mm) given as seconds since the epoch, as the clock at the dropzone shows it */
export function clockInZone(seconds: number, timeZone?: string | null, format = 'hh:mm'): string {
  return DateTime.fromSeconds(seconds, { zone: resolveTimeZone(timeZone) }).toFormat(format);
}

/** The instant (seconds since the epoch) that is the given time of day, today, at the dropzone */
export function timeTodayInZone(
  hour: number,
  minute: number,
  timeZone?: string | null,
  now: DateTime = DateTime.now()
): number {
  return now
    .setZone(resolveTimeZone(timeZone))
    .set({ hour, minute, second: 0, millisecond: 0 })
    .toSeconds();
}
