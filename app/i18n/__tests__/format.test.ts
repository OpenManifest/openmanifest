import { DateTime } from 'luxon';
import { act } from '@testing-library/react-native';
import { applyTerms } from '../index';
import skydiving from '../fixtures/skydiving.json';
import {
  formatCall,
  formatDate,
  formatDateTime,
  compactAltitude,
  parseQuantity,
  formatDestination,
  formatMoney,
  formatQuantity,
  formatRelative,
  formatTime,
} from '../format';
import { formatCents } from 'app/utils/money';
import { setOperatorFormat } from '../operatorFormat';

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

  it('uses the template word for a call', async () => {
    await act(() => applyTerms(skydiving));

    expect(formatCall(10)).toBe('10 minute boarding call');
    expect(formatCall(20)).toBe('20 minute boarding call');
  });
});

describe('destinations', () => {
  const ft = { altitude: 'ft' };
  const m = { altitude: 'm' };

  it('formatDestination shows the name of a site, route or section', () => {
    expect(formatDestination({ name: 'Rottnest Island', kind: 'site' }, ft)).toBe(
      'Rottnest Island'
    );
    expect(formatDestination({ name: 'Airport run' })).toBe('Airport run');
    expect(formatDestination(null)).toBe('');
  });

  it('formatDestination shows an altitude as thousands of feet for an operator in feet', () => {
    expect(
      formatDestination({ name: 'Full altitude', kind: 'altitude', altitudeM: 4267.2 }, ft)
    ).toBe('14k');
    expect(formatDestination({ name: 'Hop n Pop', kind: 'altitude', altitudeM: 1219.2 }, ft)).toBe(
      '4k'
    );
  });

  it('compactAltitude writes 12.5k in feet and whole metres in metres', () => {
    expect(compactAltitude(3810, ft)).toBe('12.5k');
    expect(compactAltitude(4267.2, m)).toBe('4267 m');
    expect(compactAltitude(null, ft)).toBe('');
  });

  it('compactAltitude follows the units of the operator the app shows', () => {
    setOperatorFormat({ units: ft });
    expect(compactAltitude(4267.2)).toBe('14k');
    setOperatorFormat({ units: m });
    expect(compactAltitude(4267.2)).toBe('4267 m');
    setOperatorFormat({ units: {} });
  });
});

describe('quantities', () => {
  afterEach(() => setOperatorFormat({ units: {}, currency: 'AUD' }));

  it('formatQuantity shows an SI quantity in the unit of the operator', () => {
    expect(formatQuantity(80, 'mass', { mass: 'kg' })).toBe('80 kg');
    expect(formatQuantity(80, 'mass', { mass: 'lb' })).toBe('176.4 lb');
    expect(formatQuantity(5.14444, 'speed', { speed: 'kn' })).toBe('10 kn');
    expect(formatQuantity(5.14444, 'speed', { speed: 'kmh' })).toBe('19 km/h');
    expect(formatQuantity(4267.2, 'altitude', { altitude: 'ft' })).toBe('14,000 ft');
    expect(formatQuantity(1500, 'distance', { distance: 'km' })).toBe('1.5 km');
    expect(formatQuantity(1609.344, 'distance', { distance: 'mi' })).toBe('1 mi');
    expect(formatQuantity(21, 'temperature', { temperature: 'c' })).toBe('21°C');
    expect(formatQuantity(21, 'temperature', { temperature: 'f' })).toBe('70°F');
  });

  it('formatQuantity shows metric when the operator names no unit', () => {
    expect(formatQuantity(80, 'mass')).toBe('80 kg');
    expect(formatQuantity(1500, 'distance', {})).toBe('1.5 km');
    expect(formatQuantity(null, 'mass')).toBe('');
  });

  it('formatQuantity follows the units the app was given', () => {
    setOperatorFormat({ units: { mass: 'lb' } });

    expect(formatQuantity(100, 'mass')).toBe('220.5 lb');
  });

  it('parseQuantity reads what was typed in the unit of the operator as SI', () => {
    expect(parseQuantity('176.4', 'mass', { mass: 'lb' })).toBeCloseTo(80.01, 1);
    expect(parseQuantity('176,4 lb', 'mass', { mass: 'lb' })).toBeCloseTo(80.01, 1);
    expect(parseQuantity('14000', 'altitude', { altitude: 'ft' })).toBeCloseTo(4267.2, 5);
    expect(parseQuantity('70', 'temperature', { temperature: 'f' })).toBeCloseTo(21.11, 2);
    expect(parseQuantity('', 'mass')).toBeNull();
    expect(parseQuantity('abc', 'mass')).toBeNull();
  });

  it('formatMoney and formatCents use the currency of the operator', () => {
    expect(formatCents(1250)).toBe('$12.50');
    setOperatorFormat({ currency: 'NZD' });
    expect(formatCents(1250)).toContain('12.50');
    expect(formatCents(1250)).not.toBe('$12.50');
    expect(formatMoney(-1250, 'AUD')).toBe('-$12.50');
  });
});
