import { DateTime } from 'luxon';
import { act } from '@testing-library/react-native';
import { applyTerms } from '../index';
import skydiving from '../fixtures/skydiving.json';
import {
  formatCall,
  formatDate,
  formatDateTime,
  formatDestination,
  formatMoney,
  formatQuantity,
  formatRelative,
  formatTime,
} from '../format';

// 2027-10-08 23:30 in Brisbane (UTC+10) is 2027-10-08 13:30 UTC; in Los Angeles (UTC-7) it is the morning of the 8th
const instant = '2027-10-08T13:30:00Z';

describe('formatMoney', () => {
  it('formats cents in Australian dollars by default', () => {
    expect(formatMoney(1250)).toBe('$12.50');
    expect(formatMoney(0)).toBe('$0.00');
    expect(formatMoney(null)).toBe('$0.00');
    expect(formatMoney(100000)).toBe('$1,000.00');
  });

  it('keeps the sign in front of the symbol', () => {
    expect(formatMoney(-1250)).toBe('-$12.50');
  });

  it('formats other currencies', () => {
    expect(formatMoney(1250, 'EUR')).toContain('12.50');
    expect(formatMoney(1250, 'EUR')).toMatch(/€|EUR/);
  });
});

describe('formatDate, formatTime', () => {
  it('use the operator time zone, not the device', () => {
    expect(formatDate(instant, 'Australia/Brisbane')).toBe('8 Oct 2027');
    expect(formatTime(instant, 'Australia/Brisbane')).toBe('23:30');
    expect(formatDate(instant, 'Pacific/Auckland')).toBe('9 Oct 2027');
    expect(formatTime(instant, 'Pacific/Auckland')).toBe('02:30');
    expect(formatDate(instant, 'America/Los_Angeles')).toBe('8 Oct 2027');
    expect(formatTime(instant, 'America/Los_Angeles')).toBe('06:30');
  });

  it('write the month in words so the order of day and month is never in doubt', () => {
    expect(formatDate('2027-01-02T12:00:00Z', 'UTC')).toBe('2 Jan 2027');
    expect(formatDate('2027-09-03T12:00:00Z', 'UTC')).toBe('3 Sep 2027');
  });

  it('show a 12 hour clock on request', () => {
    expect(formatTime(instant, 'Australia/Brisbane', { hour12: true })).toBe('11:30 pm');
    expect(formatTime('2027-10-08T00:05:00Z', 'UTC', { hour12: true })).toBe('12:05 am');
    expect(formatTime('2027-10-08T12:00:00Z', 'UTC', { hour12: true })).toBe('12:00 pm');
    expect(formatTime('2027-10-08T09:05:00Z', 'UTC')).toBe('09:05');
  });

  it('accept seconds, dates and luxon dates', () => {
    const seconds = Date.parse(instant) / 1000;

    expect(formatTime(seconds, 'Australia/Brisbane')).toBe('23:30');
    expect(formatTime(new Date(instant), 'Australia/Brisbane')).toBe('23:30');
    expect(formatTime(DateTime.fromISO(instant), 'Australia/Brisbane')).toBe('23:30');
  });

  it('combine date and time', () => {
    expect(formatDateTime(instant, 'Australia/Brisbane')).toBe('8 Oct 2027, 23:30');
    expect(formatDateTime(instant, 'Australia/Brisbane', { hour12: true })).toBe(
      '8 Oct 2027, 11:30 pm'
    );
  });
});

describe('formatRelative', () => {
  const now = '2027-10-08T13:30:00Z';

  it('says how far away a time is', () => {
    expect(formatRelative('2027-10-08T13:40:00Z', now)).toBe('in 10 minutes');
    expect(formatRelative('2027-10-08T13:25:00Z', now)).toBe('5 minutes ago');
    expect(formatRelative('2027-10-08T15:30:00Z', now)).toBe('in 2 hours');
  });
});

describe('formatCall', () => {
  afterEach(() => act(() => applyTerms(null)));

  it('uses the generic word for a call by default', () => {
    expect(formatCall(10)).toBe('10 minute call');
  });

  it('uses the template word for a call', () => {
    act(() => applyTerms(skydiving));

    expect(formatCall(10)).toBe('10 minute boarding call');
    expect(formatCall(20)).toBe('20 minute boarding call');
  });
});

describe('stubs completed by later tasks', () => {
  it('formatDestination shows the name', () => {
    expect(formatDestination({ name: 'Rottnest Island' })).toBe('Rottnest Island');
    expect(formatDestination(null)).toBe('');
  });

  it('formatQuantity shows a number with its unit', () => {
    expect(formatQuantity(240, 'kg')).toBe('240 kg');
    expect(formatQuantity(12.34, 'km')).toBe('12.3 km');
    expect(formatQuantity(1200, null)).toBe('1,200');
    expect(formatQuantity(null, 'kg')).toBe('');
  });
});
