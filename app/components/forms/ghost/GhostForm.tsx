import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText, Divider } from 'react-native-paper';
import { actions, useAppSelector, useAppDispatch } from '../../../state';
import NumberField from '../../input/number_input/NumberField';

import LicenseChipSelect from '../../input/chip_select/LicenseChipSelect';
import FederationSelect from '../../input/dropdown_select/FederationSelect';
import RoleSelect from '../../input/dropdown_select/RoleSelect';

export default function SlotForm() {
  const state = useAppSelector((root) => root.forms.ghost);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (state.original) {
      if (!state.fields.exitWeight.value) {
        dispatch(
          actions.forms.ghost.setField([
            'exitWeight',
            state.original.exitWeight?.toString() || '60',
          ])
        );
      }

      if (!state.fields.license.value && state.original?.license?.id) {
        if (state.original.license.federation) {
          dispatch(actions.forms.ghost.setFederation(state.original.license.federation));
        }
        dispatch(actions.forms.ghost.setField(['license', state.original.license]));
      }
    }
  }, [
    dispatch,
    state.fields.exitWeight.value,
    state.fields.license.value,
    state.original,
    state.original?.id,
  ]);

  return (
    <>
      <TextInput
        style={styles.field}
        mode="outlined"
        label="Name"
        error={!!state.fields.name.error}
        value={state.fields.name?.value?.toString() || ''}
        onChangeText={(newValue) => dispatch(actions.forms.ghost.setField(['name', newValue]))}
      />

      <HelperText type={state.fields.name.error ? 'error' : 'info'}>
        {state.fields.name.error || ' '}
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Email"
        error={!!state.fields.email.error}
        value={state.fields.email?.value?.toString() || ''}
        onChangeText={(newValue) => dispatch(actions.forms.ghost.setField(['email', newValue]))}
      />

      <HelperText type={state.fields.email.error ? 'error' : 'info'}>
        {state.fields.email.error || ' '}
      </HelperText>

      <NumberField
        mode="outlined"
        label="Exit weight (kg)"
        error={!!state.fields.exitWeight.error}
        value={Number(state.fields.exitWeight?.value)}
        onChangeText={(newValue) =>
          dispatch(actions.forms.ghost.setField(['exitWeight', newValue?.toString()]))
        }
      />

      <HelperText type={state.fields.exitWeight.error ? 'error' : 'info'}>
        {state.fields.exitWeight.error || ''}
      </HelperText>

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
