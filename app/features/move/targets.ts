import { LoadState, LoadVehicleRole } from 'app/api/schema.d';
import type { LoadDetailsFragment } from 'app/api/operations';
import { placesOf } from 'app/features/board/places';

type TargetLoad = Pick<
  LoadDetailsFragment,
  'id' | 'loadNumber' | 'state' | 'vehicles' | 'crew' | 'maxSlots' | 'occupiedSlots'
>;

/** Why a place cannot be moved there: the load has left (or never will), or has no free place */
export type TargetBlock = 'closed' | 'full';

/** Somewhere a place can go: a load, and on a load with several vehicles that carry, one of them */
export type MoveTarget = {
  key: string;
  loadId: string;
  loadNumber: number;
  loadVehicleId: string | null;
  vehicleName: string | null;
  free: number;
  blocked: TargetBlock | null;
};

const OPEN_STATES: string[] = [LoadState.Open, LoadState.Boarding];

/**
 * Where a place can be moved: every load of the day, and every vehicle of a load that has several; the place's own
 * load and vehicle are left out. The ones that cannot take it stay in the list with the reason.
 */
export function moveTargets(
  loads: readonly TargetLoad[],
  from: { loadId: string; loadVehicleId?: string | null }
): MoveTarget[] {
  return [...loads]
    .sort((a, b) => a.loadNumber - b.loadNumber)
    .flatMap((load) => {
      const closed = !OPEN_STATES.includes(load.state ?? '');
      const carrying = (load.vehicles ?? []).filter(
        ({ role }) => role === LoadVehicleRole.Carrying
      );
      const options =
        carrying.length > 1
          ? carrying.map((loadVehicle) => ({
              loadVehicleId: loadVehicle.id,
              vehicleName: loadVehicle.vehicle?.name ?? null,
              free: Math.max(
                0,
                (loadVehicle.capacity ?? loadVehicle.vehicle?.capacity ?? 0) -
                  (loadVehicle.slotsCount ?? 0)
              ),
            }))
          : [
              {
                loadVehicleId: null,
                vehicleName: null,
                free: Math.max(0, placesOf(load).capacity - placesOf(load).filled),
              },
            ];
      return options
        .filter(
          ({ loadVehicleId }) =>
            load.id !== from.loadId ||
            (loadVehicleId !== null && loadVehicleId !== from.loadVehicleId)
        )
        .map(({ loadVehicleId, vehicleName, free }) => ({
          key: `${load.id}:${loadVehicleId ?? ''}`,
          loadId: load.id,
          loadNumber: load.loadNumber,
          loadVehicleId,
          vehicleName,
          free,
          blocked: closed ? ('closed' as const) : free === 0 ? ('full' as const) : null,
        }));
    });
}
