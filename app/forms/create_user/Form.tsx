import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { FormTextField } from 'app/components/input/text/TextField';

import { Control, useWatch } from 'react-hook-form';
import { FormNumberField } from 'app/components/input/number_input';
import { FederationSelectField, RoleSelectField } from 'app/components/input/dropdown_select';
import { LicenseChipSelectField } from 'app/components/input/chip_select';

import { UserFields } from './useForm';
import { useTranslation } from 'react-i18next';
import { Divider, Stack } from 'app/ui';

interface IGhostFormProps {
  control: Control<UserFields>;
}
export default function GhostForm(props: IGhostFormProps) {
  const { t } = useTranslation('common');
  const { control } = props;

  const { federation, license } = useWatch({ control });

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
        {...{ control }}
      />

      <Divider />

      <View style={{ width: '100%' }}>
        <FederationSelectField {...{ control }} name="federation" />

        {(license?.federation?.id || federation?.id) && (
          <LicenseChipSelectField name="license" {...{ control }} />
        )}
      </View>
      <RoleSelectField name="role" {...{ control }} />
    </Stack>
  );
}
