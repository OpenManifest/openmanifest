import { creditAfter, defaultsOf, filterMembers, hasDefaults, sortReadyFirst } from '../members';

const member = (overrides: Record<string, unknown> = {}) =>
  ({
    id: '1',
    user: { id: 'u1', name: 'Ann', bodyMassKg: '72.0' },
    creditsCents: 5000,
    eligibility: { ready: true, rules: [] },
    lastSlot: null,
    ...overrides,
  }) as never;

describe('defaultsOf', () => {
  it('starts from the last slot of the member', () => {
    const defaults = defaultsOf(
      member({
        lastSlot: {
          bodyMassKg: 81,
          ticketType: { id: 't', costCents: 2500 },
          activityType: { id: 'a' },
          destination: { id: 'd' },
          equipment: [{ id: 'e1' }],
          extras: [{ id: 'x1' }],
          load: { id: '9', loadDate: '2026-10-19' },
        },
      })
    );

    expect(defaults).toEqual({
      ticketTypeId: 't',
      activityTypeId: 'a',
      destinationId: 'd',
      equipmentIds: ['e1'],
      extraIds: ['x1'],
      bodyMassKg: 81,
      costCents: 2500,
    });
    expect(hasDefaults(defaults)).toBe(true);
  });

  it('has nothing to start from for a member who has not flown, but knows their mass', () => {
    const defaults = defaultsOf(member());

    expect(defaults).toMatchObject({
      ticketTypeId: null,
      activityTypeId: null,
      bodyMassKg: 72,
      costCents: 0,
    });
    expect(hasDefaults(defaults)).toBe(false);
  });
});

describe('filterMembers', () => {
  const ready = member({ id: '1' });
  const blocked = member({ id: '2', eligibility: { ready: false, rules: [] } });
  const today = member({ id: '3', lastSlot: { load: { loadDate: '2026-10-20' } } });

  it('lets everyone through, or the ready ones, or those who flew today', () => {
    const all = [blocked, ready, today];

    expect(filterMembers(all, 'everyone', '2026-10-20')).toHaveLength(3);
    expect(filterMembers(all, 'ready', '2026-10-20').map(({ id }: { id: string }) => id)).toEqual([
      '1',
      '3',
    ]);
    expect(filterMembers(all, 'today', '2026-10-20').map(({ id }: { id: string }) => id)).toEqual([
      '3',
    ]);
  });

  it('puts the ready first and keeps the order otherwise', () => {
    const sorted = sortReadyFirst([blocked, ready, today]);

    expect(sorted.map(({ id }: { id: string }) => id)).toEqual(['1', '3', '2']);
  });
});

describe('creditAfter', () => {
  it('says what is left after the price, and when it goes below zero', () => {
    expect(creditAfter(5000, 2500)).toEqual({ price: 2500, left: 2500, negative: false });
    expect(creditAfter(1000, 2500)).toEqual({ price: 2500, left: -1500, negative: true });
    expect(creditAfter(null, 0)).toEqual({ price: 0, left: 0, negative: false });
  });
});
