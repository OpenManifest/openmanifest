import { nextGroupNumber, resolveDefaults, type TicketOption } from '../choices';
import { emptyGuest, guestInputs, guestProblem, needsDateOfBirth } from '../guests';
import type { SlotDefaults } from '../members';

const base: SlotDefaults = {
  ticketTypeId: 't1',
  activityTypeId: 'a1',
  destinationId: 'd1',
  equipmentIds: ['e1'],
  extraIds: ['x1'],
  bodyMassKg: 80,
  costCents: 4000,
};
const tickets: TicketOption[] = [
  { id: 't1', name: 'Full', costCents: 4000, requiresEscort: false, escortCapacity: 1 },
  {
    id: 't2',
    name: 'Tandem',
    costCents: 25000,
    requiresEscort: true,
    escortCapacity: 1,
    defaultDestination: { id: 'd2' },
  },
];

describe('resolveDefaults', () => {
  it('keeps the last slot when nothing was changed', () => {
    expect(resolveDefaults(base, {}, tickets)).toEqual(base);
  });

  it('takes the price and destination of another ticket, and none of the old extras', () => {
    expect(resolveDefaults(base, { ticketTypeId: 't2' }, tickets)).toMatchObject({
      ticketTypeId: 't2',
      costCents: 25000,
      destinationId: 'd2',
      extraIds: [],
      equipmentIds: ['e1'],
    });
  });

  it('changes only the activity when only that was chosen', () => {
    expect(resolveDefaults(base, { activityTypeId: 'a2' }, tickets)).toEqual({
      ...base,
      activityTypeId: 'a2',
    });
  });

  it('starts from nothing for a member without a last slot', () => {
    const none: SlotDefaults = { ...base, ticketTypeId: null, activityTypeId: null, costCents: 0 };
    expect(
      resolveDefaults(none, { ticketTypeId: 't1', activityTypeId: 'a1' }, tickets)
    ).toMatchObject({
      ticketTypeId: 't1',
      activityTypeId: 'a1',
      costCents: 4000,
    });
  });
});

describe('nextGroupNumber', () => {
  it('is one after the highest group on the load', () => {
    expect(nextGroupNumber([{ groupNumber: 1 }, { groupNumber: 3 }, { groupNumber: null }])).toBe(
      4
    );
    expect(nextGroupNumber([])).toBe(1);
    expect(nextGroupNumber(undefined)).toBe(1);
  });
});

describe('guests', () => {
  const guest = { name: 'Gus', bodyMassKg: 70, dateOfBirth: '' };

  it('needs at least one guest and at most the capacity', () => {
    expect(guestProblem([], 1, false)).toBe('count');
    expect(guestProblem([guest, guest], 1, false)).toBe('count');
    expect(guestProblem([guest], 1, false)).toBeNull();
  });

  it('names what is missing: a name, then an exit weight, then a date of birth when the ticket asks', () => {
    expect(guestProblem([{ ...guest, name: ' ' }], 1, false)).toBe('name');
    expect(guestProblem([{ ...guest, bodyMassKg: null }], 1, false)).toBe('mass');
    expect(guestProblem([guest], 1, true)).toBe('dob');
    expect(guestProblem([{ ...guest, dateOfBirth: '2001-02-03' }], 1, true)).toBeNull();
  });

  it('asks for a date of birth when the ticket has an age limit', () => {
    expect(needsDateOfBirth({ min_age: 18 })).toBe(true);
    expect(needsDateOfBirth({ max_body_mass_kg: 100 })).toBe(false);
    expect(needsDateOfBirth(null)).toBe(false);
  });

  it('sends the date of birth only when there is one', () => {
    expect(guestInputs([{ ...emptyGuest(), name: ' Gus ', bodyMassKg: 70 }])).toEqual([
      { name: 'Gus', bodyMassKg: 70, dateOfBirth: undefined },
    ]);
  });
});
