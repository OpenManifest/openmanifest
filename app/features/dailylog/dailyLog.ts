import { DateTime } from 'luxon';
import type { DailyLogEntryFragment } from 'app/api/operations';

export type DailyLogValues = { dutyOfficerId: string | null; notes: string };

/** What the form starts from: the day's duty officer and notes */
export function valuesOf(
  entry?: Pick<DailyLogEntryFragment, 'dutyOfficer' | 'notes'> | null
): DailyLogValues {
  return { dutyOfficerId: entry?.dutyOfficer?.id ?? null, notes: entry?.notes ?? '' };
}

/** Whether the form says something other than the day does */
export function changed(initial: DailyLogValues, values: DailyLogValues): boolean {
  return (
    initial.dutyOfficerId !== values.dutyOfficerId || initial.notes.trim() !== values.notes.trim()
  );
}

/** The day as a date of the API (`yyyy-MM-dd`) from the seconds of the date picker */
export function isoDayOf(seconds: number): string {
  return DateTime.fromSeconds(seconds).toISODate() as string;
}

/** The seconds of the date picker for a day of the API */
export function secondsOf(isoDay: string): number {
  return DateTime.fromISO(isoDay).toSeconds();
}

/** "Fri, 6 Nov 2026": the heading of the day */
export function dayTitle(isoDay: string): string {
  return DateTime.fromISO(isoDay).toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
}

/** A day of the future cannot be logged yet: the picker clamps to today */
export function clampToToday(
  isoDay: string,
  today: string = DateTime.local().toISODate() as string
): string {
  return isoDay > today ? today : isoDay;
}
