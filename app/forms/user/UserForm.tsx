import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Control, useController, useWatch } from 'react-hook-form';
import { HelperText, Divider } from 'react-native-paper';
import { FormTextField } from 'app/components/input/text/TextField';
import { FormNumberField } from 'app/components/input/number_input';
import { LicenseChipSelectField } from 'app/components/input/chip_select/LicenseChipSelect';
import FederationSelect from 'app/components/input/dropdown_select/FederationSelect';
import { UserFields } from './useForm';

export interface IUserFormProps {
  control: Control<UserFields>;
}

export default function UserForm(props: IUserFormProps) {
  const { control } = props;
  const { field: federation, fieldState: federationState } = useController({
    name: 'federation',
    control,
  });
  const license = useWatch({ control, name: 'license' });
  const federationId = license?.federation?.id || federation.value?.id;

  return (
    <>
      <FormTextField {...{ control }} style={styles.field} name="name" label="Name" />
      <FormTextField {...{ control }} style={styles.field} name="nickname" label="Nickname" />
      <FormTextField {...{ control }} style={styles.field} name="email" label="Email" />
      <FormTextField {...{ control }} style={styles.field} name="phone" label="Phone" />
      <FormNumberField {...{ control }} name="exitWeight" label="Exit weight (kg)" />

      <Divider />

      <View style={{ width: '100%' }}>
        <FederationSelect
          value={license?.federation || federation.value}
          onChange={federation.onChange}
        />

        <HelperText type={federationState.error ? 'error' : 'info'}>
          {federationState.error?.message || ''}
        </HelperText>

        {federationId && (
          <LicenseChipSelectField
            {...{ control }}
            name="license"
            federationId={Number(federationId)}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 8,
    width: '100%',
  },
});
