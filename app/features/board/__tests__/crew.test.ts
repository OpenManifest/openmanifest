import { LoadVehicleRole } from 'app/api/schema.d';
import { crewSlots, roleAppliesTo } from '../crew';
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

  it('gives a support vehicle the crew of a role that names its kind only (a chase vehicle its chase crew)', () => {
    const balloon = { ...caravan, id: 'v4', name: 'Sunrise', kind: 'balloon' };
    const chase = { ...caravan, id: 'v5', name: 'Chase One', kind: 'chase_vehicle' };
    const balloonPilot = { ...pilotRole, vehicleKinds: ['balloon'] };
    const chaseCrew = {
      ...pilotRole,
      id: 'r3',
      key: 'chase_crew',
      name: 'Chase crew',
      required: false,
      vehicleKinds: ['chase_vehicle'],
      position: 3,
    };
    const anyCarrier = { ...pilotRole, id: 'r4', vehicleKinds: [], position: 4 };
    const load = makeLoad({
      vehicles: [loadVehicle('a', balloon), loadVehicle('s', chase, 0, LoadVehicleRole.Support)],
    });

    expect(crewSlots(load, [balloonPilot, chaseCrew, anyCarrier]).map(({ key }) => key)).toEqual([
      'r1-a',
      'r3-s',
      'r4-a',
    ]);
    expect(roleAppliesTo(chaseCrew, chase, LoadVehicleRole.Support)).toBe(true);
    expect(roleAppliesTo(anyCarrier, chase, LoadVehicleRole.Support)).toBe(false);
    expect(roleAppliesTo(chaseCrew, balloon, LoadVehicleRole.Carrying)).toBe(false);
  });
});
