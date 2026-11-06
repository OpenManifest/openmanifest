import { LoadState, LoadVehicleRole } from 'app/api/schema.d';
import type { LoadDetailsFragment } from 'app/api/operations';
import {
  filterPeople,
  isSearchShortcut,
  lastLoadOf,
  manifestTargets,
  nameOf,
  NO_FILTER,
  peopleOf,
  roleLabel,
  roleOptions,
  sortPeople,
  summaryOf,
  type Person,
} from '../people';

const rule = (code: string, ok: boolean, status = ok ? 'PASS' : 'FAIL', extra = {}) => ({
  code,
  ok,
  status,
  message: null,
  problem: null,
  bypassed: false,
  expiresAt: null,
  amountCents: null,
  ...extra,
});

const person = (
  id: string,
  name: string,
  extra: {
    role?: { id: string; name: string } | null;
    rules?: ReturnType<typeof rule>[];
    ready?: boolean;
    creditsCents?: number | null;
    lastDate?: string | null;
    nickname?: string | null;
  } = {}
) =>
  ({
    id,
    walletId: `w${id}`,
    creditsCents: extra.creditsCents ?? 0,
    role: extra.role === undefined ? { id: 'r1', name: 'fun_jumper', operatorId: 1 } : extra.role,
    certificationLevel: null,
    user: { id: `u${id}`, name, nickname: extra.nickname ?? null },
    eligibility: {
      ready: extra.ready ?? !(extra.rules ?? []).some((each) => !each.ok),
      rules: extra.rules ?? [],
    },
    lastSlot: extra.lastDate
      ? { id: `s${id}`, load: { id: `l${id}`, loadDate: extra.lastDate } }
      : null,
  }) as unknown as Person;

describe('peopleOf', () => {
  it('takes the people out of the connection, skipping empty edges', () => {
    const data = {
      memberships: { edges: [{ node: person('1', 'Ann') }, null, { node: null }] },
    } as never;

    expect(peopleOf(data).map(({ id }) => id)).toEqual(['1']);
    expect(peopleOf(undefined)).toEqual([]);
  });
});

describe('summaryOf', () => {
  it('is ready when every rule passes', () => {
    expect(summaryOf({ ready: true, rules: [rule('credits', true)] })).toEqual({
      status: 'ready',
      rule: null,
    });
  });

  it('is expiring with the rule that runs out soon', () => {
    const summary = summaryOf({
      ready: true,
      rules: [rule('credits', true), rule('membership', true, 'EXPIRING')],
    });

    expect(summary.status).toBe('expiring');
    expect(summary.rule?.code).toBe('membership');
  });

  it('is blocked by the first rule that fails, before one that runs out', () => {
    const summary = summaryOf({
      ready: false,
      rules: [rule('membership', true, 'EXPIRING'), rule('credits', false)],
    });

    expect(summary).toEqual({
      status: 'blocked',
      rule: expect.objectContaining({ code: 'credits' }),
    });
  });

  it('is blocked when the server says so, even with no rule to show', () => {
    expect(summaryOf({ ready: false, rules: [] })).toEqual({ status: 'blocked', rule: null });
  });

  it('counts a failure the desk may let through as blocked: the member still has the problem', () => {
    expect(
      summaryOf({ ready: true, rules: [rule('credits', false, 'FAIL', { bypassed: true })] }).status
    ).toBe('blocked');
  });
});

describe('names and roles', () => {
  it('goes by the nickname when there is one', () => {
    expect(nameOf(person('1', 'Jo Jumper', { nickname: 'JJ' }))).toBe('JJ');
    expect(nameOf(person('1', 'Jo Jumper'))).toBe('Jo Jumper');
  });

  it('writes a role as the pickers do', () => {
    expect(roleLabel('fun_jumper')).toBe('Fun Jumper');
    expect(roleLabel(null)).toBe('');
  });

  it('offers the operator’s roles by name, and any other role of the people loaded', () => {
    const roles = [
      { id: '2', name: 'student' },
      { id: '1', name: 'fun_jumper' },
    ];
    expect(roleOptions(roles, [])).toEqual([
      { id: '1', label: 'Fun Jumper' },
      { id: '2', label: 'Student' },
    ]);
    expect(
      roleOptions(null, [
        person('1', 'A', { role: { id: '7', name: 'pilot' } }),
        person('2', 'B', { role: { id: '7', name: 'pilot' } }),
        person('3', 'C', { role: null }),
      ])
    ).toEqual([{ id: '7', label: 'Pilot' }]);
    expect(
      roleOptions(roles, [person('1', 'A', { role: { id: '1', name: 'fun_jumper' } })])
    ).toEqual([
      { id: '1', label: 'Fun Jumper' },
      { id: '2', label: 'Student' },
    ]);
  });
});

describe('filterPeople', () => {
  const people = [
    person('1', 'Ann', { role: { id: 'r1', name: 'fun_jumper' } }),
    person('2', 'Bob', { role: { id: 'r2', name: 'student' }, rules: [rule('credits', false)] }),
    person('3', 'Cat', { rules: [rule('membership', true, 'EXPIRING')] }),
  ];

  it('lets everyone through without a filter', () => {
    expect(filterPeople(people, NO_FILTER)).toHaveLength(3);
  });

  it('keeps one role', () => {
    expect(filterPeople(people, { roleId: 'r2', status: 'all' }).map(({ id }) => id)).toEqual([
      '2',
    ]);
  });

  it('keeps the ready, the expiring or the blocked', () => {
    const ids = (status: 'ready' | 'expiring' | 'blocked') =>
      filterPeople(people, { roleId: null, status }).map(({ id }) => id);

    expect(ids('ready')).toEqual(['1']);
    expect(ids('expiring')).toEqual(['3']);
    expect(ids('blocked')).toEqual(['2']);
  });

  it('combines the role and the status', () => {
    expect(filterPeople(people, { roleId: 'r1', status: 'blocked' })).toEqual([]);
  });
});

describe('sortPeople', () => {
  const people = [
    person('1', 'cat', { creditsCents: 500, lastDate: '2026-10-01' }),
    person('2', 'Ann', { creditsCents: -100, rules: [rule('membership', true, 'EXPIRING')] }),
    person('3', 'Bob', {
      creditsCents: 500,
      rules: [rule('credits', false)],
      lastDate: '2026-10-19',
    }),
  ];
  const order = (sort: Parameters<typeof sortPeople>[1]) =>
    sortPeople(people, sort).map(({ user }) => user.name);

  it('sorts by name, whatever the case', () => {
    expect(order('name')).toEqual(['Ann', 'Bob', 'cat']);
  });

  it('puts who needs something first: blocked, expiring, then ready', () => {
    expect(order('status')).toEqual(['Bob', 'Ann', 'cat']);
  });

  it('puts the least credit first, ties by name', () => {
    expect(order('credit')).toEqual(['Ann', 'Bob', 'cat']);
  });

  it('puts who flew last first and who never flew at the end', () => {
    expect(order('lastLoad')).toEqual(['Bob', 'cat', 'Ann']);
  });

  it('leaves the list it was given alone', () => {
    sortPeople(people, 'name');
    expect(people.map(({ id }) => id)).toEqual(['1', '2', '3']);
  });
});

describe('lastLoadOf', () => {
  it('is today, a date, or never', () => {
    expect(lastLoadOf(person('1', 'A', { lastDate: '2026-10-20' }), '2026-10-20')).toEqual({
      when: 'today',
      date: '2026-10-20',
    });
    expect(lastLoadOf(person('1', 'A', { lastDate: '2026-10-01' }), '2026-10-20').when).toBe(
      'date'
    );
    expect(lastLoadOf(person('1', 'A'), '2026-10-20')).toEqual({ when: 'never', date: null });
  });
});

describe('manifestTargets', () => {
  const load = (id: string, number: number, state: LoadState, occupied = 0) =>
    ({
      id,
      loadNumber: number,
      state,
      maxSlots: 4,
      occupiedSlots: occupied,
      crew: [],
      vehicles: [
        {
          id: `v${id}`,
          role: LoadVehicleRole.Carrying,
          capacity: 4,
          slotsCount: occupied,
          vehicle: { id: 'p', capacity: 4 },
        },
      ],
    }) as unknown as LoadDetailsFragment;

  it('offers the open loads and the one on call, by number, with their free places', () => {
    const targets = manifestTargets([
      load('3', 3, LoadState.Open, 4),
      null,
      load('1', 1, LoadState.Departed),
      load('2', 2, LoadState.Boarding, 1),
      load('4', 4, LoadState.Cancelled),
    ]);

    expect(targets.map(({ load: { id }, free }) => [id, free])).toEqual([
      ['2', 3],
      ['3', 0],
    ]);
  });
});

describe('isSearchShortcut', () => {
  it('is a plain "/" outside a field', () => {
    expect(isSearchShortcut({ key: '/', target: { tagName: 'DIV' } })).toBe(true);
    expect(isSearchShortcut({ key: '/', target: null })).toBe(true);
  });

  it('is a slash when typed into a field, and not the shortcut with a modifier', () => {
    expect(isSearchShortcut({ key: '/', target: { tagName: 'input' } })).toBe(false);
    expect(isSearchShortcut({ key: '/', target: { tagName: 'TEXTAREA' } })).toBe(false);
    expect(isSearchShortcut({ key: '/', target: { isContentEditable: true } })).toBe(false);
    expect(isSearchShortcut({ key: '/', ctrlKey: true, target: null })).toBe(false);
    expect(isSearchShortcut({ key: '?', target: null })).toBe(false);
  });
});
