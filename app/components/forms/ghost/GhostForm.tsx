import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import TextInput from 'app/components/input/text/TextField';
import { HelperText, Divider } from 'react-native-paper';
import { actions, useAppSelector, useAppDispatch } from '../../../state';
import NumberField from '../../input/number_input/NumberField';

import LicenseChipSelect from '../../input/chip_select/LicenseChipSelect';
import FederationSelect from '../../input/dropdown_select/FederationSelect';
import RoleSelect from '../../input/dropdown_select/RoleSelect';

export default function GhostForm() {
  const state = useAppSelector((root) => root.forms.ghost);
  const dispatch = useAppDispatch();

  return (
    <>
      <TextInput
        style={styles.field}
        label="Name"
        error={state.fields.name.error}
        value={state.fields.name?.value?.toString() || ''}
        onChange={(newValue) => dispatch(actions.forms.ghost.setField(['name', newValue]))}
      />

      <TextInput
        style={styles.field}
        label="Email"
        error={state.fields.email.error}
        value={state.fields.email?.value?.toString() || ''}
        onChange={(newValue) => dispatch(actions.forms.ghost.setField(['email', newValue]))}
      />

      <NumberField
        label="Exit weight (kg)"
        error={state.fields.exitWeight.error}
        value={Number(state.fields.exitWeight?.value)}
        onChange={(newValue) =>
          dispatch(actions.forms.ghost.setField(['exitWeight', newValue?.toString()]))
        }
      />

      <Divider />

      <View style={{ width: '100%' }}>
        <FederationSelect
          value={state?.fields?.license?.value?.federation || state.federation.value}
          onSelect={(value) => dispatch(actions.forms.ghost.setFederation(value))}
        />

        <HelperText type={state.federation.error ? 'error' : 'info'}>
          {state.federation.error || ''}
        </HelperText>

        {(state?.fields?.license?.value?.federation?.id || state?.federation?.value?.id) && (
          <>
            <LicenseChipSelect
              value={state.fields.license.value}
              federationId={Number(
                state?.fields?.license?.value?.federation?.id || state.federation?.value?.id
              )}
              onSelect={(value) => dispatch(actions.forms.ghost.setField(['license', value]))}
            />
            <HelperText type={state.fields.license.error ? 'error' : 'info'}>
              {state.fields.license.error || ''}
            </HelperText>
          </>
        )}
      </View>
      <RoleSelect
        value={state.fields.role?.value || null}
        onSelect={(newValue) => dispatch(actions.forms.ghost.setField(['role', newValue]))}
      />

      <HelperText type={state.fields.phone.error ? 'error' : 'info'}>
        {state.fields.phone.error || ''}
      </HelperText>
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    flex: 1,
    width: '100%',
    paddingTop: 32,
  },
  field: {
    marginBottom: 8,
    width: '100%',
  },
  ticketAddons: {
    marginBottom: 8,
  },
});
