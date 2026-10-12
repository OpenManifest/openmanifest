import { VehicleEssentialsFragment } from 'app/api/operations';
import { useVehiclesQuery } from 'app/api/reflection';
import { uniqBy } from 'lodash';
import * as React from 'react';
import { useSession } from 'app/state';
import { useTranslation } from 'react-i18next';
import { Subheader } from 'app/ui';
import { withHookForm } from '../withHookForm';
import ChipSelect from './ChipSelect';
import ChipSelectSkeleton from './ChipSelectSkeleton';

interface IVehicleSelect {
  value?: VehicleEssentialsFragment | null;
  error?: string | null;
  onLoadingStateChanged?(loading: boolean): void;
  onChange(jt: VehicleEssentialsFragment): void;
}

function VehicleChipSelect(props: IVehicleSelect) {
  const { t } = useTranslation(['common', 'terms']);
  const { value, onChange, onLoadingStateChanged, error } = props;
  const currentOperatorId = useSession((session) => session.currentOperatorId);

  const { data, loading } = useVehiclesQuery({
    variables: {
      operatorId: currentOperatorId?.toString() as string,
    },
  });

  React.useEffect(() => {
    onLoadingStateChanged?.(loading);
  }, [loading, onLoadingStateChanged]);

  return loading ? (
    <ChipSelectSkeleton />
  ) : (
    <>
      <Subheader>{t('terms:vehicle', { count: 1 })}</Subheader>
      <ChipSelect<VehicleEssentialsFragment>
        autoSelectFirst
        {...{ error }}
        items={uniqBy([...(data?.vehicles || [])], ({ id }) => id) || []}
        value={[value].filter(Boolean) as VehicleEssentialsFragment[]}
        renderItemLabel={(vehicle: VehicleEssentialsFragment) => vehicle?.name || ''}
        isDisabled={(vehicle) => false}
        onChange={([first]) => (first ? onChange(first as VehicleEssentialsFragment) : null)}
      />
    </>
  );
}

export const VehicleChipSelectField = withHookForm(VehicleChipSelect);

export default VehicleChipSelect;
