import { CrewRoleEssentialsFragment, VehicleEssentialsFragment } from 'app/api/operations';
import { LoadVehicleRole } from 'app/api/schema.d';
import { roleAppliesTo } from 'app/features/board/crew';

type Role = Pick<CrewRoleEssentialsFragment, 'id' | 'scope' | 'vehicleKinds'>;

export type CrewSlot<R extends Role> = {
  /** Where the form keeps who fills it: the role, and the vehicle for a role per vehicle */
  key: string;
  role: R;
  vehicle: VehicleEssentialsFragment | null;
};

export type LoadVehicleEntry = { vehicle: VehicleEssentialsFragment; role: LoadVehicleRole };

/**
 * The vehicles of a new load and what they do: the ones listed with the multi_vehicle module (a balloon that carries,
 * its chase vehicle that supports), else the one vehicle, which carries
 */
export function loadVehicles(fields: {
  vehicle?: VehicleEssentialsFragment | null;
  vehicleRoles?: LoadVehicleEntry[] | null;
  multiVehicle: boolean;
}): LoadVehicleEntry[] {
  if (fields.multiVehicle) {
    return (fields.vehicleRoles ?? []).filter(({ vehicle }) => !!vehicle);
  }
  return fields.vehicle ? [{ vehicle: fields.vehicle, role: LoadVehicleRole.Carrying }] : [];
}

/**
 * The places of a new load's crew: a role of the load is filled once, a role per vehicle once for each vehicle it
 * applies to (one that carries, of the kinds the role lists if it lists any; a support vehicle only of a listed kind).
 */
export function crewSlots<R extends Role>(roles: R[], vehicles: LoadVehicleEntry[]): CrewSlot<R>[] {
  return roles.flatMap((role): CrewSlot<R>[] =>
    role.scope === 'load'
      ? [{ key: `${role.id}_load`, role, vehicle: null }]
      : vehicles
          .filter(({ vehicle, role: vehicleRole }) => roleAppliesTo(role, vehicle, vehicleRole))
          .map(({ vehicle }) => ({ key: `${role.id}_${vehicle.id}`, role, vehicle }))
  );
}
