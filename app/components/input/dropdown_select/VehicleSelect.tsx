import { VehicleEssentialsFragment } from 'app/api/operations';
import { useVehiclesQuery } from 'app/api/reflection';
import * as React from 'react';
import { useOperatorContext } from 'app/providers/operator/context';
import Select from '../select/Select';
import { withHookForm } from '../withHookForm';

interface IVehicleSelect {
  value?: VehicleEssentialsFragment | null;
  onCHange(vehicle: VehicleEssentialsFragment): void;
}
function VehicleSelect(props: IVehicleSelect) {
  const { onCHange, value } = props;
  const { operator: currentOperator } = useOperatorContext();

  const { data } = useVehiclesQuery({
    variables: {
      operatorId: currentOperator?.operator?.id?.toString() as string,
    },
  });

  const selected = React.useMemo(
    () => data?.vehicles?.find((node) => node?.id === value?.id),
    [data?.vehicles, value?.id]
  );
  const options = React.useMemo(
    () =>
      data?.vehicles?.map((node) => ({
        label: node?.name || '',
        value: node as VehicleEssentialsFragment,
      })) || [],
    [data?.vehicles]
  );

  return (
    <Select<VehicleEssentialsFragment> value={selected} options={options} onChange={onCHange} />
  );
}

export const VehicleSelectField = withHookForm(VehicleSelect);

export default VehicleSelect;
