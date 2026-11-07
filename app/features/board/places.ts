import { LoadVehicleRole } from 'app/api/schema.d';
import type { LoadDetailsFragment } from 'app/api/operations';

type PlacesLoad = Pick<LoadDetailsFragment, 'vehicles' | 'crew' | 'maxSlots' | 'occupiedSlots'> & {
  slots?: LoadDetailsFragment['slots'] | null;
};

export type Places = {
  /** Places for participants: the seats of the carrying vehicles, less the crew that sits in one */
  capacity: number;
  /** Places taken by participants */
  filled: number;
};

/** The crew that takes a place of the vehicle (a pilot sits in the aircraft, a guide on the ground does not) */
export function seatedCrew(load: Pick<PlacesLoad, 'crew'>): number {
  return (load.crew ?? []).filter(({ crewRole, membership }) => crewRole.occupiesSlot && membership)
    .length;
}

/**
 * How full a load is: the capacity comes from the vehicles that carry (a support vehicle has no participants) minus the
 * crew that occupies a place; a load without vehicles falls back to the places the server counted.
 */
export function placesOf(load: PlacesLoad): Places {
  const carrying = (load.vehicles ?? []).filter(({ role }) => role === LoadVehicleRole.Carrying);
  if (!carrying.length) {
    const crew = seatedCrew(load);
    return {
      capacity: Math.max(0, (load.maxSlots ?? 0) - crew),
      filled: Math.max(0, (load.occupiedSlots ?? 0) - crew),
    };
  }
  const seats = carrying.reduce(
    (sum, { capacity, vehicle }) => sum + (capacity ?? vehicle.capacity ?? 0),
    0
  );
  return {
    capacity: Math.max(0, seats - seatedCrew(load)),
    filled: carrying.reduce((sum, { slotsCount }) => sum + (slotsCount ?? 0), 0),
  };
}
