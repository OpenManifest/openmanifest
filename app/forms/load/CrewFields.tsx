import * as React from 'react';
import { Control, useWatch } from 'react-hook-form';
import { useCrewRolesQuery } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';
import { MembershipChipSelectField } from 'app/components/input/chip_select';
import { useOperatorContext } from 'app/providers/operator/context';
import { moduleEnabled } from 'app/utils/modules';
import { carryingVehicles, crewSlots } from './crew';
import { LoadFields } from './useForm';

interface ICrewFieldsProps {
  control: Control<LoadFields>;
}

/** One chip select for each place in the crew of the load, from the operator's crew roles (a pilot for each aircraft, a guide for each raft) */
export default function CrewFields({ control }: ICrewFieldsProps) {
  const {
    operator: { operator },
  } = useOperatorContext();
  const { data } = useCrewRolesQuery({
    variables: { operatorId: operator?.id?.toString() as string },
    skip: !operator?.id,
  });
  const { vehicle, vehicleRoles } = useWatch({ control });
  const vehicles = carryingVehicles({
    vehicle: vehicle as never,
    vehicleRoles: vehicleRoles as never,
    multiVehicle: moduleEnabled(operator?.modules, 'multi_vehicle'),
  });

  return (
    <>
      {crewSlots(data?.operator?.crewRoles ?? [], vehicles).map(
        ({ key, role, vehicle: carrier }) => (
          <MembershipChipSelectField
            key={key}
            {...{ control }}
            name={`crew.${key}` as never}
            label={carrier && vehicles.length > 1 ? `${role.name} · ${carrier.name}` : role.name}
            requiredPermissions={role.permission ? [role.permission as Permission] : []}
          />
        )
      )}
    </>
  );
}
