import { guestInputsOf, guestsError, guestValuesOf } from '../guests';

describe('guests of an escort', () => {
  it('reads the guests of a slot being edited', () => {
    expect(
      guestValuesOf([
        { bodyMassKg: 70, guest: { name: 'Pat', bodyMassKg: 72, email: 'pat@example.com' } },
        { bodyMassKg: 55, guest: null },
      ])
    ).toEqual([
      {
        name: 'Pat',
        bodyMassKg: 72,
        email: 'pat@example.com',
        phone: undefined,
        dateOfBirth: undefined,
        emergencyContact: undefined,
      },
      {
        name: '',
        bodyMassKg: 55,
        email: undefined,
        phone: undefined,
        dateOfBirth: undefined,
        emergencyContact: undefined,
      },
    ]);
    expect(guestValuesOf(undefined)).toEqual([]);
  });

  it('sends only the details that were filled in', () => {
    expect(
      guestInputsOf([{ name: 'Pat', bodyMassKg: 72, email: '', phone: '0400', dateOfBirth: null }])
    ).toEqual([
      {
        name: 'Pat',
        bodyMassKg: 72,
        email: undefined,
        phone: '0400',
        dateOfBirth: undefined,
        emergencyContact: undefined,
      },
    ]);
  });

  describe('guestsError', () => {
    it('accepts guests with a name and an exit weight, up to the capacity', () => {
      const guests = [
        { name: 'Pat', bodyMassKg: 70 },
        { name: 'Sam', bodyMassKg: 80 },
      ];
      expect(guestsError(guests, 4)).toBeNull();
      expect(guestsError([], 1)).toBeNull();
    });

    it('refuses more guests than the ticket takes', () => {
      const guests = [
        { name: 'Pat', bodyMassKg: 70 },
        { name: 'Sam', bodyMassKg: 80 },
      ];
      expect(guestsError(guests, 1)).toBe('Up to 1 for each escort');
    });

    it('wants a name and an exit weight of every guest', () => {
      expect(guestsError([{ name: ' ', bodyMassKg: 70 }], 1)).toBe('Every guest needs a name');
      expect(guestsError([{ name: 'Pat', bodyMassKg: null }], 1)).toBe(
        'Every guest needs an exit weight'
      );
    });
  });
});
