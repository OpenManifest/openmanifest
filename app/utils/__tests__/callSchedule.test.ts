import { formatCallSchedule, parseCallSchedule } from '../callSchedule';

describe('parseCallSchedule', () => {
  it('reads whole minutes, longest first', () => {
    expect(parseCallSchedule('20, 15, 10')).toEqual([20, 15, 10]);
    expect(parseCallSchedule('30 5')).toEqual([30, 5]);
    expect(parseCallSchedule('45')).toEqual([45]);
  });

  it('reads empty text as no calls', () => {
    expect(parseCallSchedule('')).toEqual([]);
    expect(parseCallSchedule('  ')).toEqual([]);
    expect(parseCallSchedule(null)).toEqual([]);
  });

  it('refuses what the server refuses', () => {
    expect(parseCallSchedule('10, 15')).toBeNull();
    expect(parseCallSchedule('10, 10')).toBeNull();
    expect(parseCallSchedule('0')).toBeNull();
    expect(parseCallSchedule('-5')).toBeNull();
    expect(parseCallSchedule('7.5')).toBeNull();
    expect(parseCallSchedule('ten')).toBeNull();
    expect(parseCallSchedule('60, 50, 40, 30, 20, 15, 10')).toBeNull();
  });
});

describe('formatCallSchedule', () => {
  it('writes the minutes the way they are typed', () => {
    expect(formatCallSchedule([20, 15, 10])).toBe('20, 15, 10');
    expect(formatCallSchedule([])).toBe('');
    expect(formatCallSchedule(undefined)).toBe('');
  });
});
