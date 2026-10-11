import { DateTime, Settings } from 'luxon';
import {
  clockInZone,
  dateInZone,
  isTodayInZone,
  resolveTimeZone,
  timeTodayInZone,
  todayInZone,
} from '../dropzoneTime';

// A device in UTC, a dropzone in Brisbane (UTC+10, no daylight saving): at 23:00 UTC on 8 October it is already
// 09:00 on 9 October at the dropzone
const NOW = DateTime.fromISO('2026-10-08T23:00:00Z');

describe('dropzone time', () => {
  const originalZone = Settings.defaultZone;
  beforeEach(() => {
    Settings.defaultZone = 'UTC';
  });
  afterEach(() => {
    Settings.defaultZone = originalZone;
  });

  it('today is the dropzone date, not the device date', () => {
    expect(NOW.toISODate()).toBe('2026-10-08');
    expect(todayInZone('Australia/Brisbane', NOW)).toBe('2026-10-09');
    expect(todayInZone('America/Los_Angeles', NOW)).toBe('2026-10-08');
  });

  it('moves to the next day when midnight comes at the dropzone', () => {
    const beforeMidnight = DateTime.fromISO('2026-10-08T13:59:00Z');
    const midnight = DateTime.fromISO('2026-10-08T14:00:00Z');

    expect(todayInZone('Australia/Brisbane', beforeMidnight)).toBe('2026-10-08');
    expect(todayInZone('Australia/Brisbane', midnight)).toBe('2026-10-09');
  });

  it('places an instant on the day it falls on at the dropzone', () => {
    expect(dateInZone('2026-10-08T16:00:00Z', 'Australia/Brisbane')).toBe('2026-10-09');
    expect(dateInZone('2026-10-08T09:00:00Z', 'Australia/Brisbane')).toBe('2026-10-08');
  });

  it('knows whether an instant is today at the dropzone', () => {
    expect(isTodayInZone('2026-10-08T16:00:00Z', 'Australia/Brisbane', NOW)).toBe(true);
    expect(isTodayInZone('2026-10-08T09:00:00Z', 'Australia/Brisbane', NOW)).toBe(false);
    // The same instants on a device date comparison would say the opposite
    expect(DateTime.fromISO('2026-10-08T16:00:00Z').hasSame(NOW, 'day')).toBe(true);
  });

  it('shows call times as the clock at the dropzone', () => {
    const seconds = DateTime.fromISO('2026-10-08T23:30:00Z').toSeconds();

    expect(clockInZone(seconds, 'Australia/Brisbane', 'HH:mm')).toBe('09:30');
    expect(clockInZone(seconds, 'UTC', 'HH:mm')).toBe('23:30');
  });

  it('turns a time of day at the dropzone into an instant of its day', () => {
    // 10:15 today at the dropzone is 00:15 UTC on the same date
    const seconds = timeTodayInZone(10, 15, 'Australia/Brisbane', NOW);

    expect(DateTime.fromSeconds(seconds, { zone: 'UTC' }).toISO()).toBe('2026-10-09T00:15:00.000Z');
  });

  it('falls back to the device zone for an unknown zone, or none', () => {
    Settings.defaultZone = 'Europe/Paris';

    expect(resolveTimeZone(undefined)).toBe('Europe/Paris');
    expect(resolveTimeZone('Not/AZone')).toBe('Europe/Paris');
    expect(resolveTimeZone('Australia/Brisbane')).toBe('Australia/Brisbane');
  });
});
