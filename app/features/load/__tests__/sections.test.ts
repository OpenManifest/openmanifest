import { LoadVehicleRole } from 'app/api/schema.d';
import {
  caravan,
  loadVehicle,
  makeLoad,
  membership,
  pilotRole,
  slotOf,
} from 'app/__fixtures__/board.fixture';
import { bracketGroups, buildSections } from '../sections';
import { readinessOf } from '../eligibility';

const labels = { notAssigned: 'No aircraft' };
const kinds = (items: { type: string }[]) => items.map(({ type }) => type);

describe('bracketGroups', () => {
  it('puts the people of a group next to each other and marks the ends', () => {
    const items = bracketGroups([
      slotOf('1', 'Ann', { groupNumber: 1 }),
      slotOf('2', 'Bo'),
      slotOf('3', 'Cy', { groupNumber: 1 }),
      slotOf('4', 'Di', { groupNumber: 1 }),
    ]);

    expect(items.map(({ slot }) => slot.id)).toEqual(['1', '3', '4', '2']);
    expect(items.map(({ group }) => group?.position ?? null)).toEqual([
      'first',
      'middle',
      'last',
      null,
    ]);
  });

  it('does not bracket someone alone in their group number', () => {
    expect(bracketGroups([slotOf('1', 'Ann', { groupNumber: 3 })])[0].group).toBeNull();
  });
});

describe('buildSections', () => {
  it('lists the places and one row for the free ones', () => {
    const load = makeLoad({
      vehicles: [loadVehicle('lv1', caravan, 2)],
      slots: [slotOf('1', 'Ann'), slotOf('2', 'Bo')],
    });

    const items = buildSections(load, labels);

    expect(kinds(items)).toEqual(['place', 'place', 'free']);
    expect(items[2]).toMatchObject({ count: 14 });
  });

  it('takes the places of crew that sit in the vehicle off the free ones', () => {
    const load = makeLoad({
      vehicles: [loadVehicle('lv1', caravan, 1)],
      crew: [
        {
          id: 'c',
          crewRole: { ...pilotRole, occupiesSlot: true },
          membership: membership('Pat'),
          loadVehicle: { id: 'lv1' },
        },
      ],
      slots: [slotOf('1', 'Ann')],
    });

    expect(buildSections(load, labels).at(-1)).toMatchObject({ type: 'free', count: 14 });
  });

  it('has no free row when the load is full', () => {
    const load = makeLoad({
      vehicles: [loadVehicle('lv1', { ...caravan, capacity: 1 }, 1)],
      slots: [slotOf('1', 'Ann')],
    });

    expect(kinds(buildSections(load, labels))).toEqual(['place']);
  });

  it('has a heading and its own free places for each vehicle of a load with several, and the people in none last', () => {
    const otter = { ...caravan, id: 'v2', name: 'Otter', capacity: 3 };
    const load = makeLoad({
      vehicles: [
        loadVehicle('a', { ...caravan, capacity: 2 }, 1),
        loadVehicle('b', otter, 1),
        loadVehicle('t', { ...caravan, id: 'v3', name: 'Tug' }, 0, LoadVehicleRole.Support),
      ],
      slots: [
        slotOf('1', 'Ann', { loadVehicle: { id: 'a' } }),
        slotOf('2', 'Bo', { loadVehicle: { id: 'b' } }),
        slotOf('3', 'Cy'),
      ],
    });

    const items = buildSections(load, labels);

    expect(
      items.map(
        (item) =>
          `${item.type}:${'title' in item ? item.title : 'slot' in item ? item.slot.id : item.count}`
      )
    ).toEqual([
      'header:Caravan',
      'place:1',
      'free:1',
      'header:Otter',
      'place:2',
      'free:2',
      'header:No aircraft',
      'place:3',
    ]);
    expect(items[0]).toMatchObject({ filled: 1, capacity: 2 });
  });
});

describe('readinessOf', () => {
  const rule = (code: string, status: string, extra = {}) =>
    ({ code, ok: status !== 'FAIL', status, bypassed: false, ...extra }) as any;

  it('is ready when every rule passes', () => {
    expect(readinessOf([rule('credits', 'PASS'), rule('age', 'NOT_REQUIRED')]).status).toBe(
      'ready'
    );
    expect(readinessOf(null).status).toBe('ready');
  });

  it('is blocked by the first failing rule, unless it may be let through', () => {
    expect(readinessOf([rule('credits', 'PASS'), rule('certification', 'FAIL')])).toMatchObject({
      status: 'blocked',
      result: { code: 'certification' },
    });
    expect(readinessOf([rule('certification', 'FAIL', { bypassed: true })]).status).toBe('ready');
  });

  it('warns about a rule that runs out soon', () => {
    expect(readinessOf([rule('equipment_service', 'EXPIRING')])).toMatchObject({
      status: 'expiring',
    });
  });
});
