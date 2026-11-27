import { LoadState, LoadVehicleRole } from 'app/api/schema.d';
import { moveTargets } from '../targets';

const vehicle = (id: string, name: string, capacity: number, slotsCount: number) => ({
  id: `lv${id}`,
  role: LoadVehicleRole.Carrying,
  position: 0,
  capacity,
  slotsCount,
  vehicle: { id, name, capacity },
});

const load = (id: string, number: number, extra: Record<string, unknown> = {}) =>
  ({
    id,
    loadNumber: number,
    state: LoadState.Open,
    maxSlots: 10,
    occupiedSlots: 4,
    vehicles: [vehicle(`v${id}`, 'Otter', 10, 4)],
    crew: [],
    ...extra,
  }) as never;

describe('moveTargets', () => {
  it('lists the other loads in order, with their free places', () => {
    const targets = moveTargets([load('2', 2), load('1', 1), load('3', 3)], { loadId: '1' });

    expect(targets.map(({ loadNumber, free, blocked }) => [loadNumber, free, blocked])).toEqual([
      [2, 6, null],
      [3, 6, null],
    ]);
  });

  it('says why a load cannot take the place: it has left, or it is full', () => {
    const targets = moveTargets(
      [
        load('2', 2, { state: LoadState.Departed }),
        load('3', 3, { occupiedSlots: 10, vehicles: [vehicle('v3', 'Otter', 10, 10)] }),
        load('4', 4, { state: LoadState.Boarding }),
      ],
      { loadId: '1' }
    );

    expect(targets.map(({ blocked }) => blocked)).toEqual(['closed', 'full', null]);
  });

  it('offers each vehicle of a load that has several, and the other vehicle of the place’s own load', () => {
    const two = load('1', 1, {
      vehicles: [vehicle('a', 'Raft 1', 6, 6), vehicle('b', 'Raft 2', 8, 3)],
    });

    const targets = moveTargets([two, load('2', 2)], { loadId: '1', loadVehicleId: 'lva' });

    expect(
      targets.map(({ loadId, vehicleName, free, blocked }) => [loadId, vehicleName, free, blocked])
    ).toEqual([
      ['1', 'Raft 2', 5, null],
      ['2', null, 6, null],
    ]);
  });
});
