import * as React from 'react';
import { Permission } from 'app/api/schema.d';
import { View } from 'react-native';
import { FormTextField } from 'app/components/input/text/TextField';

import { Control } from 'react-hook-form';
import {
  MembershipChipSelectField,
  VehicleChipSelectField,
} from 'app/components/input/chip_select';
import { FormNumberField } from 'app/components/input/number_input';
import { LoadFields } from './useForm';
import { useTranslation } from 'react-i18next';
import { Divider, Stack } from 'app/ui';

interface ILoadFormProps {
  control: Control<LoadFields>;
}
export default function LoadForm(props: ILoadFormProps) {
  const { t } = useTranslation('common');
  const { control } = props;

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
        <VehicleChipSelectField {...{ control }} name="vehicle" />

        <MembershipChipSelectField
          label={t('forms.load.gca')}
          {...{ control }}
          name="gca"
          requiredPermissions={[Permission.ActAsGca]}
        />

        <MembershipChipSelectField
          label={t('forms.load.pilot')}
          name="pilot"
          {...{ control }}
          requiredPermissions={[Permission.ActAsPilot]}
        />
        <Divider spacing="sm" />
      </View>
    </Stack>
  );
}
