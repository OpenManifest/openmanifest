import { LoadVehicleRole } from 'app/api/schema.d';
import { crewSlots } from '../crew';
import {
  caravan,
  guideRole,
  loadVehicle,
  makeLoad,
  membership,
  pilotRole,
} from 'app/__fixtures__/board.fixture';

describe('crewSlots', () => {
  it('has a place for a role of the load, and one for each carrying vehicle for a role per vehicle', () => {
    const second = { ...caravan, id: 'v2', name: 'Otter' };
    const load = makeLoad({
      vehicles: [loadVehicle('a', caravan), loadVehicle('b', second)],
      crew: [
        { id: 'c1', crewRole: pilotRole, membership: membership('Pat'), loadVehicle: { id: 'b' } },
      ],
    });

    const slots = crewSlots(load, [guideRole, pilotRole]);

    expect(slots.map(({ key, label }) => [key, label])).toEqual([
      ['r1-a', 'Pilot · Caravan'],
      ['r1-b', 'Pilot · Otter'],
      ['r2', undefined],
    ]);
    expect(slots[0].member).toBeUndefined();
    expect(slots[1].member?.user.name).toBe('Pat');
  });

  it('names a role plainly when the load has one vehicle, and skips a vehicle the role does not apply to', () => {
    const boat = { ...caravan, id: 'v3', kind: 'boat' };
    const load = makeLoad({
      vehicles: [loadVehicle('a', caravan), loadVehicle('s', boat, 0, LoadVehicleRole.Support)],
    });

    expect(crewSlots(load, [pilotRole])).toEqual([
      expect.objectContaining({ key: 'r1-a', label: undefined }),
    ]);
  });
});
