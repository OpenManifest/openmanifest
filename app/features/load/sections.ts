import { LoadVehicleRole } from 'app/api/schema.d';
import type { LoadDetailsFragment, SlotDetailsFragment } from 'app/api/operations';
import { placesOf } from 'app/features/board/places';

type Slot = SlotDetailsFragment;

/** Where a place sits in a group of people who fly together: they are bracketed on the screen */
export type GroupPosition = 'first' | 'middle' | 'last' | 'only';

export type PlaceItem = {
  type: 'place';
  key: string;
  slot: Slot;
  /** The group number, with the place in its group; null for someone who flies alone */
  group: { number: number; position: GroupPosition } | null;
};

export type FreeItem = { type: 'free'; key: string; count: number; loadVehicleId: string | null };

export type HeaderItem = {
  type: 'header';
  key: string;
  title: string | null;
  vehicleKind: string | null;
  filled: number;
  capacity: number;
};

export type SectionItem = HeaderItem | PlaceItem | FreeItem;

/** The people of a group next to each other, in the order the first of each came; each person in a group alone is a group of one */
export function bracketGroups(slots: readonly Slot[]): PlaceItem[] {
  const ordered: Slot[] = [];
  const done = new Set<string>();
  slots.forEach((slot) => {
    if (done.has(slot.id)) return;
    done.add(slot.id);
    ordered.push(slot);
    if (slot.groupNumber > 0) {
      slots.forEach((other) => {
        if (!done.has(other.id) && other.groupNumber === slot.groupNumber) {
          done.add(other.id);
          ordered.push(other);
        }
      });
    }
  });

  return ordered.map((slot, index) => {
    const size =
      slot.groupNumber > 0 ? ordered.filter((s) => s.groupNumber === slot.groupNumber).length : 0;
    if (size < 2) return { type: 'place', key: slot.id, slot, group: null };
    const before = ordered[index - 1]?.groupNumber === slot.groupNumber;
    const after = ordered[index + 1]?.groupNumber === slot.groupNumber;
    const position: GroupPosition = before ? (after ? 'middle' : 'last') : 'first';
    return { type: 'place', key: slot.id, slot, group: { number: slot.groupNumber, position } };
  });
}

type Labels = { notAssigned: string };

/**
 * The rows of a load, top to bottom. A load with one vehicle that carries is one list; with several it has a header and
 * its own places for each (and the people who ride in none after them). The places that are still free are one row.
 */
export function buildSections(
  load: Pick<LoadDetailsFragment, 'vehicles' | 'crew' | 'maxSlots' | 'occupiedSlots'> & {
    slots?: readonly Slot[] | null;
  },
  labels: Labels
): SectionItem[] {
  const slots = load.slots ?? [];
  const carrying = (load.vehicles ?? []).filter(({ role }) => role === LoadVehicleRole.Carrying);

  if (carrying.length < 2) {
    const { capacity, filled } = placesOf({ ...load, slots: [...slots] });
    const items: SectionItem[] = bracketGroups(slots);
    const free = Math.max(0, capacity - Math.max(filled, slots.length));
    if (free)
      items.push({
        type: 'free',
        key: 'free',
        count: free,
        loadVehicleId: carrying[0]?.id ?? null,
      });
    return items;
  }

  const items: SectionItem[] = [];
  const assigned = new Set<string>();
  carrying.forEach((loadVehicle) => {
    const inVehicle = slots.filter((slot) => slot.loadVehicle?.id === loadVehicle.id);
    inVehicle.forEach((slot) => assigned.add(slot.id));
    const seatedCrew = (load.crew ?? []).filter(
      ({ crewRole, membership, loadVehicle: crewVehicle }) =>
        crewRole.occupiesSlot && membership && crewVehicle?.id === loadVehicle.id
    ).length;
    const capacity = Math.max(
      0,
      (loadVehicle.capacity ?? loadVehicle.vehicle.capacity ?? 0) - seatedCrew
    );
    items.push({
      type: 'header',
      key: `vehicle-${loadVehicle.id}`,
      title: loadVehicle.vehicle.name ?? loadVehicle.vehicle.registration ?? loadVehicle.id,
      vehicleKind: loadVehicle.vehicle.kind ?? null,
      filled: inVehicle.length,
      capacity,
    });
    items.push(...bracketGroups(inVehicle));
    const free = Math.max(0, capacity - inVehicle.length);
    if (free)
      items.push({
        type: 'free',
        key: `free-${loadVehicle.id}`,
        count: free,
        loadVehicleId: loadVehicle.id,
      });
  });
  const rest = slots.filter((slot) => !assigned.has(slot.id));
  if (rest.length) {
    items.push({
      type: 'header',
      key: 'vehicle-none',
      title: labels.notAssigned,
      vehicleKind: null,
      filled: rest.length,
      capacity: rest.length,
    });
    items.push(...bracketGroups(rest));
  }
  return items;
}
