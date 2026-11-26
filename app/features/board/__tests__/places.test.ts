import { LoadVehicleRole } from 'app/api/schema.d';
import { placesOf, seatedCrew } from '../places';
import {
  caravan,
  guideRole,
  loadVehicle,
  makeLoad,
  membership,
  pilotRole,
} from 'app/__fixtures__/board.fixture';

describe('placesOf', () => {
  it('is the seats of the carrying vehicles less the crew that sits in one', () => {
    const load = makeLoad({
      vehicles: [
        loadVehicle('a', caravan, 5),
        loadVehicle('b', { ...caravan, id: 'v2', capacity: 4 }, 2),
      ],
      crew: [
        { id: 'c1', crewRole: pilotRole, membership: membership('Pat'), loadVehicle: { id: 'a' } },
        { id: 'c2', crewRole: guideRole, membership: membership('Gus'), loadVehicle: null },
      ],
    });

    expect(placesOf(load)).toEqual({ capacity: 19, filled: 7 });
    expect(seatedCrew(load)).toBe(1);
  });

  it('does not count a support vehicle', () => {
    const load = makeLoad({
      vehicles: [
        loadVehicle('a', caravan, 5),
        loadVehicle('t', { ...caravan, id: 'tug', capacity: 1 }, 0, LoadVehicleRole.Support),
      ],
    });

    expect(placesOf(load)).toEqual({ capacity: 16, filled: 5 });
  });

  it('does not count a crew role nobody fills', () => {
    const load = makeLoad({
      crew: [{ id: 'c1', crewRole: pilotRole, membership: null, loadVehicle: null }],
    });

    expect(placesOf(load).capacity).toBe(16);
  });

  it('falls back to the places the server counted for a load without vehicles', () => {
    expect(placesOf(makeLoad({ vehicles: [], maxSlots: 12, occupiedSlots: 4 }))).toEqual({
      capacity: 12,
      filled: 4,
    });
  });
});
