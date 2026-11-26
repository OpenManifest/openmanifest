import { LoadVehicleRole } from 'app/api/schema.d';
import type { CrewRoleEssentialsFragment, LoadDetailsFragment } from 'app/api/operations';

export type CrewSlot = {
  key: string;
  role: CrewRoleEssentialsFragment;
  /** "Guide · Raft 2" when the role is filled once for each of several vehicles */
  label?: string;
  /** The vehicle of the load the role is filled for; null for a role of the whole load */
  loadVehicleId: string | null;
  member?: NonNullable<LoadDetailsFragment['crew']>[number]['membership'] | null;
};

/**
 * One place for each crew role the load has: once for a role of the load, and once for each carrying vehicle the role
 * applies to for a role per vehicle (so a two-raft load shows a guide for each raft).
 */
export function crewSlots(
  load: Pick<LoadDetailsFragment, 'vehicles' | 'crew'>,
  roles: readonly CrewRoleEssentialsFragment[]
): CrewSlot[] {
  const carrying = (load.vehicles ?? []).filter(({ role }) => role === LoadVehicleRole.Carrying);

  return [...roles]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .flatMap((role): CrewSlot[] => {
      if (role.scope === 'load') {
        const assignment = load.crew?.find(
          ({ crewRole, loadVehicle }) => crewRole.id === role.id && !loadVehicle
        );
        return [{ key: role.id, role, loadVehicleId: null, member: assignment?.membership }];
      }
      return carrying
        .filter(
          ({ vehicle }) =>
            !role.vehicleKinds?.length || role.vehicleKinds.includes(vehicle.kind ?? '')
        )
        .map((loadVehicle) => ({
          key: `${role.id}-${loadVehicle.id}`,
          role,
          loadVehicleId: loadVehicle.id,
          label: carrying.length > 1 ? `${role.name} · ${loadVehicle.vehicle.name}` : undefined,
          member: load.crew?.find(
            ({ crewRole, loadVehicle: assigned }) =>
              crewRole.id === role.id && assigned?.id === loadVehicle.id
          )?.membership,
        }));
    });
}
