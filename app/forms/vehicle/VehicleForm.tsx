import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Control } from 'react-hook-form';
import { FormNumberField } from 'app/components/input/number_input';
import { VehicleFields } from './useForm';
import { useTranslation } from 'react-i18next';
import { Stack } from 'app/ui';
import { useOperatorContext } from 'app/providers/operator/context';
import { limitsModule } from 'app/utils/limits';

export interface IVehicleFormProps {
  control: Control<VehicleFields>;
}
export default function VehicleForm(props: IVehicleFormProps) {
  const { t } = useTranslation('common');
  const { control } = props;
  const {
    operator: { operator },
  } = useOperatorContext();
  const limits = limitsModule(operator?.modules as Record<string, unknown>);
  return (
    <Stack gap="md">
      <FormTextField {...{ control }} name="name" mode="outlined" label={t('forms.fields.name')} />

      <FormTextField {...{ control }} name="registration" label={t('forms.vehicle.registration')} />
      <FormNumberField {...{ control }} name="minCapacity" label={t('forms.vehicle.minSlots')} />

      <FormNumberField
        {...{ control }}
        name="capacity"
        label={t('forms.vehicle.maxSlots')}
        helperText={t('forms.vehicle.maximumAmountOfJumpersWho')}
      />
      {limits?.payload ? (
        <FormNumberField
          {...{ control }}
          name="maxPayloadKg"
          label={t('forms.vehicle.maxPayload')}
          helperText={t('forms.vehicle.maxPayloadHelper')}
        />
      ) : null}
    </Stack>
  );
}
