import * as React from 'react';
import { LoadDetailsFragment, MembershipEssentialsFragment } from 'app/api/operations';
import { useCrewRolesQuery } from 'app/api/reflection';
import { LoadVehicleRole } from 'app/api/schema.d';
import { useSession } from 'app/state';
import CrewChip from './CrewChip';

interface ILoadCrewChipsProps {
  load?: LoadDetailsFragment | null;
  small?: boolean;
  backgroundColor?: string;
  color?: string;
  /** Called to fill `role` (for `loadVehicleId` when the role is per vehicle) with `member` */
  onSelect(
    role: { id: string },
    member: MembershipEssentialsFragment,
    loadVehicleId: string | null
  ): void;
}

/**
 * One chip for each crew role of the operator that the load has a place for: once for a role of the load, and once for
 * each vehicle of the load that carries (and the role applies to) for a role per vehicle.
 */
export default function LoadCrewChips({ load, onSelect, ...style }: ILoadCrewChipsProps) {
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const { data } = useCrewRolesQuery({
    variables: { operatorId: currentOperatorId?.toString() as string },
  });
  const carrying = (load?.vehicles ?? []).filter(({ role }) => role === LoadVehicleRole.Carrying);

  return (
    <>
      {(data?.operator?.crewRoles ?? []).flatMap((role) => {
        if (role.scope === 'load') {
          const assignment = load?.crew?.find(
            ({ crewRole, loadVehicle }) => crewRole.id === role.id && !loadVehicle
          );
          return (
            <CrewChip
              key={role.id}
              {...{ role, ...style }}
              value={assignment?.membership}
              onSelect={(member) => onSelect(role, member, null)}
            />
          );
        }
        return carrying
          .filter(
            ({ vehicle }) =>
              !role.vehicleKinds?.length || role.vehicleKinds.includes(vehicle.kind ?? '')
          )
          .map((loadVehicle) => {
            const assignment = load?.crew?.find(
              ({ crewRole, loadVehicle: assigned }) =>
                crewRole.id === role.id && assigned?.id === loadVehicle.id
            );
            return (
              <CrewChip
                key={`${role.id}-${loadVehicle.id}`}
                {...{ role, ...style }}
                label={
                  carrying.length > 1 ? `${role.name} · ${loadVehicle.vehicle.name}` : undefined
                }
                value={assignment?.membership}
                onSelect={(member) => onSelect(role, member, loadVehicle.id)}
              />
            );
          });
      })}
    </>
  );
}
