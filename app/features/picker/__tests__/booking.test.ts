import { LoadState } from 'app/api/schema.d';
import { makeLoad } from 'app/__fixtures__/board.fixture';
import { canBook, firstBookable } from '../booking';

const onIt = (membershipId: string) =>
  ({ id: `s${membershipId}`, membership: { id: membershipId } }) as never;

describe('canBook', () => {
  it('is true for an open load with a free place that the member is not on', () => {
    expect(canBook(makeLoad({ id: '1', vehicles: [], occupiedSlots: 0, maxSlots: 4 }), 'm1')).toBe(
      true
    );
  });

  it('is false without a member, for a load that has left and for one the member is on', () => {
    expect(canBook(makeLoad({ id: '1', vehicles: [], occupiedSlots: 0, maxSlots: 4 }), null)).toBe(
      false
    );
    expect(
      canBook(
        makeLoad({
          id: '1',
          vehicles: [],
          occupiedSlots: 0,
          maxSlots: 4,
          state: LoadState.Departed,
        }),
        'm1'
      )
    ).toBe(false);
    expect(
      canBook(
        makeLoad({ id: '1', vehicles: [], occupiedSlots: 0, maxSlots: 4, slots: [onIt('m1')] }),
        'm1'
      )
    ).toBe(false);
  });

  it('is false for a full load', () => {
    expect(
      canBook(
        makeLoad({ id: '1', vehicles: [], maxSlots: 1, slots: [onIt('m2')], occupiedSlots: 1 }),
        'm1'
      )
    ).toBe(false);
  });
});

describe('firstBookable', () => {
  it('is the first load of the day the member can still get on', () => {
    const full = makeLoad({ id: '1', loadNumber: 1, vehicles: [], maxSlots: 1, occupiedSlots: 1 });
    const open = makeLoad({ id: '2', loadNumber: 2, vehicles: [], occupiedSlots: 0, maxSlots: 4 });

    expect(firstBookable([full, open], 'm1')?.id).toBe('2');
    expect(firstBookable([full], 'm1')).toBeNull();
  });
});
