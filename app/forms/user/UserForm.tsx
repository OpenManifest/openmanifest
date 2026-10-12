import * as React from 'react';
import { View } from 'react-native';
import { Control, useController, useWatch } from 'react-hook-form';

import { FormTextField } from 'app/components/input/text/TextField';
import { FormNumberField } from 'app/components/input/number_input';
import { NumberFieldType } from 'app/components/input/number_input/NumberField';
import { CertificationLevelChipSelectField } from 'app/components/input/chip_select/CertificationLevelChipSelect';
import CertificationBodySelect from 'app/components/input/dropdown_select/CertificationBodySelect';
import { UserFields } from './useForm';
import { useTranslation } from 'react-i18next';
import { Divider, FieldError, Stack } from 'app/ui';

export interface IUserFormProps {
  control: Control<UserFields>;
}

export default function UserForm(props: IUserFormProps) {
  const { t } = useTranslation('common');
  const { control } = props;
  const { field: certificationBody, fieldState: certificationBodyState } = useController({
    name: 'certificationBody',
    control,
  });
  const certificationLevel = useWatch({ control, name: 'certificationLevel' });
  const certificationBodyId =
    certificationLevel?.certificationBody?.id || certificationBody.value?.id;

  return (
    <Stack gap="md">
      <FormTextField {...{ control }} name="name" label={t('forms.fields.name')} />
      <FormTextField {...{ control }} name="nickname" label={t('forms.fields.nickname')} />
      <FormTextField {...{ control }} name="email" label={t('forms.fields.email')} />
      <FormTextField {...{ control }} name="phone" label={t('forms.user.phone')} />
      <FormNumberField
        {...{ control }}
        name="bodyMassKg"
        variant={NumberFieldType.Weight}
        label={t('forms.user.exitWeightKg')}
      />

      <Divider />

      <View style={{ width: '100%' }}>
        <CertificationBodySelect
          value={certificationLevel?.certificationBody || certificationBody.value}
          onChange={certificationBody.onChange}
        />

        <FieldError>{certificationBodyState.error?.message || ''}</FieldError>

        {certificationBodyId && (
          <CertificationLevelChipSelectField
            {...{ control }}
            name="certificationLevel"
            certificationBodyId={Number(certificationBodyId)}
          />
        )}
      </View>
    </Stack>
  );
}
