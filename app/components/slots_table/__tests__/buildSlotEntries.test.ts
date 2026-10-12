import { LoadVehicleRole } from 'app/api/schema.d';
import { LoadDetailsFragment } from 'app/api/operations';
import { buildSlotEntries } from '../Table';

const labels = {
  seats: (count: number, seats: number) => `${count} of ${seats}`,
  notAssigned: 'Not in a vehicle',
};

const vehicle = (id: string, name: string, capacity: number) => ({
  __typename: 'Vehicle' as const,
  id,
  name,
  capacity,
  minCapacity: 1,
  registration: name,
});

const loadVehicle = (id: string, role: LoadVehicleRole, capacity: number) => ({
  __typename: 'LoadVehicle' as const,
  id,
  role,
  position: Number(id),
  capacity,
  slotsCount: 0,
  vehicle: vehicle(id, `Vehicle ${id}`, capacity),
});

const slot = (id: string, loadVehicleId: string | null) =>
  ({ id, loadVehicle: loadVehicleId ? { id: loadVehicleId } : null }) as never;

const load = (overrides: Partial<LoadDetailsFragment>) =>
  ({ maxSlots: 0, slots: [], vehicles: [], ...overrides }) as unknown as LoadDetailsFragment;

describe('buildSlotEntries', () => {
  it('lists the slots, then the free ones, for a load with one vehicle', () => {
    const entries = buildSlotEntries(
      load({
        maxSlots: 3,
        slots: [slot('10', null)],
        vehicles: [loadVehicle('1', LoadVehicleRole.Carrying, 3)],
      }),
      labels
    );

    expect(entries.map((entry) => entry.kind)).toEqual(['slot', 'slot', 'slot']);
    expect(entries.map((entry) => entry.key)).toEqual(['10', 'available-1', 'available-2']);
  });

  it('groups the slots by the vehicle they ride in, with the seats taken', () => {
    const entries = buildSlotEntries(
      load({
        maxSlots: 5,
        slots: [slot('10', '2'), slot('11', '1')],
        vehicles: [
          loadVehicle('1', LoadVehicleRole.Carrying, 3),
          loadVehicle('2', LoadVehicleRole.Carrying, 2),
          loadVehicle('3', LoadVehicleRole.Support, 1),
        ],
      }),
      labels
    );

    expect(entries.map((entry) => entry.key)).toEqual([
      'group-1',
      '11',
      'available-1-0',
      'available-1-1',
      'group-2',
      '10',
      'available-2-0',
    ]);
    expect(entries.filter((entry) => entry.kind === 'group').map((entry) => entry.seats)).toEqual([
      '1 of 3',
      '1 of 2',
    ]);
  });

  it('does not offer more free rows than the load has room for', () => {
    const entries = buildSlotEntries(
      load({
        maxSlots: 3,
        slots: [slot('10', '1')],
        vehicles: [
          loadVehicle('1', LoadVehicleRole.Carrying, 3),
          loadVehicle('2', LoadVehicleRole.Carrying, 3),
        ],
      }),
      labels
    );

    expect(entries.filter((entry) => entry.kind === 'slot' && !entry.slot)).toHaveLength(2);
  });

  it('puts the slots that ride in none after the groups', () => {
    const entries = buildSlotEntries(
      load({
        maxSlots: 2,
        slots: [slot('10', null)],
        vehicles: [
          loadVehicle('1', LoadVehicleRole.Carrying, 1),
          loadVehicle('2', LoadVehicleRole.Carrying, 1),
        ],
      }),
      labels
    );

    expect(entries.slice(-2).map((entry) => entry.key)).toEqual(['group-none', '10']);
  });
});
