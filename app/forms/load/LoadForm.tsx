import * as React from 'react';
import { View } from 'react-native';
import { FormTextField } from 'app/components/input/text/TextField';

import { Control } from 'react-hook-form';
import { VehicleChipSelectField } from 'app/components/input/chip_select';
import { FormNumberField } from 'app/components/input/number_input';
import { LoadFields } from './useForm';
import CrewFields from './CrewFields';
import { useTranslation } from 'react-i18next';
import { Divider, Stack } from 'app/ui';
import { useOperatorContext } from 'app/providers/operator/context';
import { DestinationListField } from 'app/components/input/destination_select';
import { destinationsModule } from 'app/utils/destinations';
import { moduleEnabled } from 'app/utils/modules';
import { VehicleListField } from 'app/components/input/vehicle_list/VehicleListField';

interface ILoadFormProps {
  control: Control<LoadFields>;
}
export default function LoadForm(props: ILoadFormProps) {
  const { t } = useTranslation('common');
  const { control } = props;
  const {
    operator: { operator },
  } = useOperatorContext();
  const multiVehicle = moduleEnabled(operator?.modules, 'multi_vehicle');
  const perLoadDestinations =
    destinationsModule(operator?.modules as Record<string, unknown>)?.scope === 'per_load';

  return (
    <Stack gap="md">
      <FormTextField
        name="name"
        label={t('forms.fields.name')}
        {...{ control }}
        placeholder={t('forms.load.optional')}
      />

      <FormNumberField label={t('forms.load.maxSlots')} {...{ control }} name="maxSlots" />
      <View style={{ width: '100%' }}>
        {multiVehicle ? (
          <VehicleListField {...{ control }} name="vehicleRoles" />
        ) : (
          <VehicleChipSelectField {...{ control }} name="vehicle" />
        )}

        <CrewFields {...{ control }} />
        {perLoadDestinations ? (
          <DestinationListField {...{ control }} name="destinationIds" />
        ) : null}
        <Divider spacing="sm" />
      </View>
    </Stack>
  );
}
