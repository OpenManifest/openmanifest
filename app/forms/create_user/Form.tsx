import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { FormTextField } from 'app/components/input/text/TextField';
import { Divider } from 'react-native-paper';
import { Control, useWatch } from 'react-hook-form';
import { FormNumberField } from 'app/components/input/number_input';
import { FederationSelectField, RoleSelectField } from 'app/components/input/dropdown_select';
import { LicenseChipSelectField } from 'app/components/input/chip_select';

import { UserFields } from './useForm';

interface IGhostFormProps {
  control: Control<UserFields>;
}
export default function GhostForm(props: IGhostFormProps) {
  const { control } = props;

  const { federation, license } = useWatch({ control });

  return (
    <>
      <FormTextField label="Name" name="name" {...{ control }} />

      <FormTextField label="Nickname" name="nickname" placeholder="Optional" {...{ control }} />

      <FormTextField label="Email" name="email" {...{ control }} />
      <FormTextField label="Phone number" name="phone" {...{ control }} />

      <FormNumberField label="Exit weight (kg)" name="exitWeight" {...{ control }} />

      <Divider />

      <View style={{ width: '100%' }}>
        <FederationSelectField {...{ control }} name="federation" />

        {(license?.federation?.id || federation?.id) && (
          <LicenseChipSelectField name="license" {...{ control }} />
        )}
      </View>
      <RoleSelectField name="role" {...{ control }} />
    </>
  );
}
