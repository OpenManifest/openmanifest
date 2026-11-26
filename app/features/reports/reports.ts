import { subMonths } from 'date-fns';
import type { OperatorStatisticsFragment } from 'app/api/operations';
import { OperatorState, OperatorStateEvent, type TimeRangeInput } from 'app/api/schema.d';

/** The periods a report covers: all time, or the last 3, 6 or 12 months */
export type RangeKey = 'all' | '3' | '6' | '12';
export const RANGES: RangeKey[] = ['all', '3', '6', '12'];

/** The time range the API filters by; `undefined` for all time */
export function timeRangeOf(range: RangeKey, now: Date = new Date()): TimeRangeInput | undefined {
  if (range === 'all') return undefined;
  return {
    startTime: subMonths(now, Number(range)).toISOString(),
    endTime: now.toISOString(),
  };
}

export type Statistics = NonNullable<OperatorStatisticsFragment['statistics']>;

/** The figures of a report: one operator's, or the sum of several */
export type Totals = {
  revenueCents: number;
  loads: number;
  cancelledLoads: number;
  slots: number;
  pilots: number;
  groundControl: number;
  dutyOfficers: number;
  users: number;
  activeUsers: number;
  inactiveUsers: number;
};

const ZERO: Totals = {
  revenueCents: 0,
  loads: 0,
  cancelledLoads: 0,
  slots: 0,
  pilots: 0,
  groundControl: 0,
  dutyOfficers: 0,
  users: 0,
  activeUsers: 0,
  inactiveUsers: 0,
};

/** The figures of one operator's statistics (zero for what is missing) */
export function totalsOf(statistics?: Partial<Statistics> | null): Totals {
  if (!statistics) return { ...ZERO };
  return {
    revenueCents: statistics.revenueCentsCount ?? 0,
    loads: statistics.loadsCount ?? 0,
    cancelledLoads: statistics.cancelledLoadsCount ?? 0,
    slots: statistics.slotsCount ?? 0,
    pilots: statistics.pilotCount ?? 0,
    groundControl: statistics.gcaCount ?? 0,
    dutyOfficers: statistics.dutyOfficerCount ?? 0,
    users: statistics.totalUserCount ?? 0,
    activeUsers: statistics.activeUserCount ?? 0,
    inactiveUsers: statistics.inactiveUserCount ?? 0,
  };
}

/** The figures of several operators added up */
export function sumTotals(statistics: readonly (Partial<Statistics> | null | undefined)[]): Totals {
  return statistics
    .map(totalsOf)
    .reduce(
      (sum, next) =>
        Object.fromEntries(
          Object.keys(ZERO).map((key) => [
            key,
            sum[key as keyof Totals] + next[key as keyof Totals],
          ])
        ) as Totals,
      { ...ZERO }
    );
}

export type Bar = { key: string; label: string; count: number };

/** Counts by name, the same names added up (several operators), the largest first */
export function barsByName(counts: readonly { name: string; count: number }[]): Bar[] {
  const byName = new Map<string, number>();
  counts.forEach(({ name, count }) => byName.set(name, (byName.get(name) ?? 0) + count));
  return [...byName.entries()]
    .map(([name, count]) => ({ key: name, label: name, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/**
 * Loads by month (`YYYY-MM`), oldest first, from the counts by day; the same day of several operators is added up.
 * `label` formats the month for the list.
 */
export function barsByMonth(
  days: readonly { date: string; count: number }[],
  label: (month: string) => string
): Bar[] {
  const byMonth = new Map<string, number>();
  days.forEach(({ date, count }) => {
    const month = date.slice(0, 7);
    byMonth.set(month, (byMonth.get(month) ?? 0) + count);
  });
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ key: month, label: label(month), count }));
}

/** How long a bar is, in percent of the longest (a count above zero always shows) */
export function barPercent(count: number, max: number): number {
  if (max <= 0 || count <= 0) return 0;
  return Math.max(2, Math.round((count / max) * 100));
}

/** The list with the value taken out if it was in, added if it was not */
export function toggled<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/** The event that moves an operator into a state */
export const STATE_EVENT: Partial<Record<OperatorState, OperatorStateEvent>> = {
  [OperatorState.Archived]: OperatorStateEvent.Archive,
  [OperatorState.InReview]: OperatorStateEvent.RequestPublication,
  [OperatorState.Private]: OperatorStateEvent.Unpublish,
  [OperatorState.Public]: OperatorStateEvent.Publish,
};
