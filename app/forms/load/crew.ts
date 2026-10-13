import { CrewRoleEssentialsFragment, VehicleEssentialsFragment } from 'app/api/operations';
import { LoadVehicleRole } from 'app/api/schema.d';

type Role = Pick<CrewRoleEssentialsFragment, 'id' | 'scope' | 'vehicleKinds'>;

export type CrewSlot<R extends Role> = {
  /** Where the form keeps who fills it: the role, and the vehicle for a role per vehicle */
  key: string;
  role: R;
  vehicle: VehicleEssentialsFragment | null;
};

/** The vehicles of a new load that carry: the ones listed with the multi_vehicle module, else the one vehicle */
export function carryingVehicles(fields: {
  vehicle?: VehicleEssentialsFragment | null;
  vehicleRoles?: { vehicle: VehicleEssentialsFragment; role: LoadVehicleRole }[] | null;
  multiVehicle: boolean;
}): VehicleEssentialsFragment[] {
  if (fields.multiVehicle) {
    return (fields.vehicleRoles ?? [])
      .filter(({ role }) => role === LoadVehicleRole.Carrying)
      .map(({ vehicle }) => vehicle);
  }
  return fields.vehicle ? [fields.vehicle] : [];
}

/**
 * The places of a new load's crew: a role of the load is filled once, a role per vehicle once for each vehicle that
 * carries (and, when the role lists kinds, is of one of them).
 */
export function crewSlots<R extends Role>(
  roles: R[],
  vehicles: VehicleEssentialsFragment[]
): CrewSlot<R>[] {
  return roles.flatMap((role): CrewSlot<R>[] =>
    role.scope === 'load'
      ? [{ key: `${role.id}_load`, role, vehicle: null }]
      : vehicles
          .filter(
            (vehicle) =>
              !role.vehicleKinds?.length || role.vehicleKinds.includes(vehicle.kind ?? '')
          )
          .map((vehicle) => ({ key: `${role.id}_${vehicle.id}`, role, vehicle }))
  );
}
