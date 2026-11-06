import { OperatorState, OperatorStateEvent } from 'app/api/schema.d';
import {
  STATE_EVENT,
  barPercent,
  barsByMonth,
  barsByName,
  sumTotals,
  timeRangeOf,
  toggled,
  totalsOf,
} from '../reports';

describe('timeRangeOf', () => {
  it('is no range for all time', () => {
    expect(timeRangeOf('all')).toBeUndefined();
  });

  it('goes back the months chosen from now', () => {
    const now = new Date('2026-11-06T10:00:00Z');
    expect(timeRangeOf('3', now)).toEqual({
      startTime: '2026-08-06T10:00:00.000Z',
      endTime: '2026-11-06T10:00:00.000Z',
    });
  });
});

describe('totals', () => {
  it('are zero without statistics', () => {
    expect(totalsOf(null).loads).toBe(0);
  });

  it('keep revenue in cents and add operators up', () => {
    const sum = sumTotals([
      { revenueCentsCount: 4000, loadsCount: 2, gcaCount: 1 },
      { revenueCentsCount: 1550, loadsCount: 3 },
      null,
    ]);
    expect(sum.revenueCents).toBe(5550);
    expect(sum.loads).toBe(5);
    expect(sum.groundControl).toBe(1);
    expect(sum.users).toBe(0);
  });
});

describe('bars', () => {
  it('add the same name up and put the largest first', () => {
    expect(
      barsByName([
        { name: 'fs', count: 2 },
        { name: 'freefly', count: 5 },
        { name: 'fs', count: 4 },
      ]).map(({ label, count }) => [label, count])
    ).toEqual([
      ['fs', 6],
      ['freefly', 5],
    ]);
  });

  it('count loads by month, oldest first', () => {
    expect(
      barsByMonth(
        [
          { date: '2026-10-02', count: 3 },
          { date: '2026-09-30', count: 1 },
          { date: '2026-10-20', count: 2 },
        ],
        (month) => `m${month}`
      )
    ).toEqual([
      { key: '2026-09', label: 'm2026-09', count: 1 },
      { key: '2026-10', label: 'm2026-10', count: 5 },
    ]);
  });

  it('are as long as their share of the largest, and a count always shows', () => {
    expect(barPercent(5, 10)).toBe(50);
    expect(barPercent(1, 1000)).toBe(2);
    expect(barPercent(0, 10)).toBe(0);
    expect(barPercent(3, 0)).toBe(0);
  });
});

it('toggles a value in a list', () => {
  expect(toggled(['a', 'b'], 'a')).toEqual(['b']);
  expect(toggled(['b'], 'a')).toEqual(['b', 'a']);
});

it('moves an operator into a state by its event, and never into a demo', () => {
  expect(STATE_EVENT[OperatorState.Public]).toBe(OperatorStateEvent.Publish);
  expect(STATE_EVENT[OperatorState.Demo]).toBeUndefined();
});
