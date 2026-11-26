import { changed, clampToToday, isoDayOf, secondsOf, valuesOf } from '../dailyLog';

it('starts from the day’s duty officer and notes', () => {
  expect(valuesOf({ dutyOfficer: { id: '7' } as never, notes: 'Windy' })).toEqual({
    dutyOfficerId: '7',
    notes: 'Windy',
  });
  expect(valuesOf(null)).toEqual({ dutyOfficerId: null, notes: '' });
});

it('is changed when the officer or the notes are, not by spaces', () => {
  const initial = { dutyOfficerId: '7', notes: 'Windy' };
  expect(changed(initial, { dutyOfficerId: '7', notes: 'Windy ' })).toBe(false);
  expect(changed(initial, { dutyOfficerId: '8', notes: 'Windy' })).toBe(true);
  expect(changed(initial, { dutyOfficerId: '7', notes: 'Calm' })).toBe(true);
});

it('goes between the days of the API and the seconds of the picker', () => {
  expect(isoDayOf(secondsOf('2026-11-06'))).toBe('2026-11-06');
});

it('does not go past today', () => {
  expect(clampToToday('2026-12-01', '2026-11-06')).toBe('2026-11-06');
  expect(clampToToday('2026-10-01', '2026-11-06')).toBe('2026-10-01');
});
