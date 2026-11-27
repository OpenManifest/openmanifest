import { LoadState } from 'app/api/schema.d';
import type { LoadDetailsFragment } from 'app/api/operations';
import { checkOf, dutiesOf, loadsOfDay, nextLoadOf, placeOn, sortedChecks } from '../today';

const slot = (id: string, membershipId: string) => ({ id, membership: { id: membershipId } });
const crew = (id: string, membershipId: string | null, role: string) => ({
  id,
  crewRole: { id: `r${id}`, name: role },
  membership: membershipId ? { id: membershipId } : null,
});
const load = (id: string, number: number, state: LoadState, extra: Record<string, unknown> = {}) =>
  ({
    id,
    loadNumber: number,
    state,
    slots: [],
    crew: [],
    ...extra,
  }) as unknown as LoadDetailsFragment;

describe('placeOn and nextLoadOf', () => {
  it('finds the member’s own place on a load', () => {
    expect(placeOn(load('1', 1, LoadState.Open, { slots: [slot('s1', 'm1')] }), 'm1')?.id).toBe(
      's1'
    );
    expect(placeOn(load('1', 1, LoadState.Open, { slots: [slot('s1', 'm1')] }), 'm2')).toBeNull();
  });

  it('is the load on call before the one still open, and the one in the air last', () => {
    const loads = [
      load('1', 1, LoadState.Departed, { slots: [slot('a', 'm1')] }),
      load('2', 2, LoadState.Open, { slots: [slot('b', 'm1')] }),
      load('3', 3, LoadState.Boarding, { slots: [slot('c', 'm1')] }),
    ];

    expect(nextLoadOf(loads, 'm1')?.load.id).toBe('3');
    expect(nextLoadOf(loads.slice(0, 2), 'm1')?.load.id).toBe('2');
    expect(nextLoadOf(loads.slice(0, 1), 'm1')?.load.id).toBe('1');
  });

  it('is nothing when the member has no place, or only on loads that are over', () => {
    expect(nextLoadOf([load('1', 1, LoadState.Open)], 'm1')).toBeNull();
    expect(
      nextLoadOf([load('1', 1, LoadState.Completed, { slots: [slot('a', 'm1')] })], 'm1')
    ).toBeNull();
    expect(
      nextLoadOf([load('1', 1, LoadState.Cancelled, { slots: [slot('a', 'm1')] })], 'm1')
    ).toBeNull();
  });
});

describe('dutiesOf', () => {
  it('lists the crew roles the member holds on loads that are not over, in load order', () => {
    const loads = [
      load('2', 2, LoadState.Open, { crew: [crew('c2', 'm1', 'Load master')] }),
      load('1', 1, LoadState.Boarding, {
        crew: [crew('c1', 'm1', 'Pilot'), crew('c3', 'm2', 'GCA'), crew('c4', null, 'GCA')],
      }),
      load('3', 3, LoadState.Completed, { crew: [crew('c5', 'm1', 'Pilot')] }),
    ];

    expect(dutiesOf(loads, 'm1').map(({ load: { id }, role }) => [id, role])).toEqual([
      ['1', 'Pilot'],
      ['2', 'Load master'],
    ]);
  });
});

describe('loadsOfDay', () => {
  it('puts what is still to fly first, then what is in the air, then what is over', () => {
    const loads = [
      load('1', 1, LoadState.Completed),
      load('2', 2, LoadState.Departed),
      load('3', 3, LoadState.Open),
      load('4', 4, LoadState.Boarding),
    ];

    expect(loadsOfDay(loads).map(({ id }) => id)).toEqual(['3', '4', '2', '1']);
  });
});

describe('the checklist', () => {
  it('says blocked for a failing rule, expiring for one that runs out, and ok for the rest', () => {
    expect(checkOf({ code: 'credits', ok: false })).toBe('blocked');
    expect(checkOf({ code: 'membership', ok: true, status: 'EXPIRING' })).toBe('expiring');
    expect(checkOf({ code: 'age', ok: true, status: 'PASS' })).toBe('ok');
  });

  it('lists what needs something first', () => {
    const rules = [
      { code: 'age', ok: true, status: 'PASS' },
      { code: 'membership', ok: true, status: 'EXPIRING' },
      { code: 'credits', ok: false, status: 'FAIL' },
    ];

    expect(sortedChecks(rules).map(({ code }) => code)).toEqual(['credits', 'membership', 'age']);
  });
});
