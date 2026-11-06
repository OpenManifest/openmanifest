import { LoadState, LoadVehicleRole } from 'app/api/schema.d';

export const pilotRole = {
  __typename: 'CrewRole',
  id: 'r1',
  key: 'pilot',
  name: 'Pilot',
  scope: 'vehicle',
  required: true,
  occupiesSlot: true,
  permission: null,
  vehicleKinds: ['aircraft'],
  position: 1,
} as any;

export const guideRole = {
  ...pilotRole,
  id: 'r2',
  key: 'guide',
  name: 'Guide',
  scope: 'load',
  required: false,
  occupiesSlot: false,
  vehicleKinds: [],
  position: 2,
} as any;

export const caravan = {
  id: 'v1',
  name: 'Caravan',
  kind: 'aircraft',
  capacity: 16,
  minCapacity: 0,
};
export const loadVehicle = (
  id: string,
  vehicle = caravan,
  slotsCount = 0,
  role = LoadVehicleRole.Carrying
) => ({ id, role, position: 1, capacity: vehicle.capacity, slotsCount, vehicle }) as any;

export const membership = (name: string, nickname: string | null = null) =>
  ({ id: `m-${name}`, user: { id: `u-${name}`, name, nickname } }) as any;

export const makeLoad = (overrides: Record<string, unknown> = {}) =>
  ({
    id: '10',
    lockVersion: 0,
    name: null,
    createdAt: '2026-10-19T00:00:00Z',
    dispatchAt: null,
    loadDate: '2026-10-19',
    loadNumber: 3,
    isFull: false,
    state: LoadState.Open,
    isOpen: true,
    weight: 0,
    maxSlots: 16,
    availableSlots: 10,
    occupiedSlots: 6,
    vehicle: caravan,
    vehicles: [loadVehicle('lv1', caravan, 5)],
    crew: [],
    destinations: [],
    slots: [],
    ...overrides,
  }) as any;

export const slotOf = (id: string, name: string, overrides: Record<string, unknown> = {}) =>
  ({
    id,
    lockVersion: 0,
    createdAt: '2026-10-19T00:00:00Z',
    bodyMassKg: 80,
    prepaid: false,
    guestSlots: [],
    wingLoading: null,
    groupNumber: 0,
    costCents: 0,
    ticketType: { id: 't1', name: 'Fun jump' },
    destination: null,
    loadVehicle: null,
    activityType: { id: 'a1', name: 'Freefly' },
    extras: [],
    equipment: [],
    membership: {
      ...membership(name),
      certificationLevel: { id: 'c1', name: 'License A' },
    },
    ...overrides,
  }) as any;
