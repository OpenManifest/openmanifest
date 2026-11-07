import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { FormTextField } from 'app/components/input/text/TextField';

import { Control, useWatch } from 'react-hook-form';
import { FormNumberField } from 'app/components/input/number_input';
import { NumberFieldType } from 'app/components/input/number_input/NumberField';
import {
  CertificationBodySelectField,
  RoleSelectField,
} from 'app/components/input/dropdown_select';
import { CertificationLevelChipSelectField } from 'app/components/input/chip_select';

import { UserFields } from './useForm';
import { useTranslation } from 'react-i18next';
import { Divider, Stack } from 'app/ui';

interface IGhostFormProps {
  control: Control<UserFields>;
}
export default function GhostForm(props: IGhostFormProps) {
  const { t } = useTranslation('common');
  const { control } = props;

  const { certificationBody, certificationLevel } = useWatch({ control });

  return (
    <Stack gap="md">
      <FormTextField label={t('forms.fields.name')} name="name" {...{ control }} />

      <FormTextField
        label={t('forms.fields.nickname')}
        name="nickname"
        placeholder={t('forms.create_user.optional')}
        {...{ control }}
      />

      <FormTextField label={t('forms.fields.email')} name="email" {...{ control }} />
      <FormTextField label={t('forms.create_user.phoneNumber')} name="phone" {...{ control }} />

      <FormNumberField
        label={t('forms.create_user.exitWeightKg')}
        name="bodyMassKg"
        variant={NumberFieldType.Weight}
        {...{ control }}
      />

      <Divider />

      <View style={{ width: '100%' }}>
        <CertificationBodySelectField {...{ control }} name="certificationBody" />

        {(certificationLevel?.certificationBody?.id || certificationBody?.id) && (
          <CertificationLevelChipSelectField name="certificationLevel" {...{ control }} />
        )}
      </View>
      <RoleSelectField name="role" {...{ control }} />
    </Stack>
  );
}
