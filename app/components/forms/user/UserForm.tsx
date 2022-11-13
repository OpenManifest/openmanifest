import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import TextInput from 'app/components/input/text/TextField';
import { HelperText, Divider } from 'react-native-paper';
import { actions, useAppSelector, useAppDispatch } from '../../../state';

import NumberField from '../../input/number_input/NumberField';
import LicenseChipSelect from '../../input/chip_select/LicenseChipSelect';
import FederationSelect from '../../input/dropdown_select/FederationSelect';

export default function SlotForm() {
  const state = useAppSelector((root) => root.forms.user);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (state.original) {
      if (!state.fields.exitWeight.value) {
        dispatch(
          actions.forms.user.setField(['exitWeight', state.original.user?.exitWeight || '60'])
        );
      }

      if (!state.fields.rigs.value && state.original?.id) {
        dispatch(actions.forms.user.setField(['rigs', state.original.user?.rigs]));
      }
    }
  }, [
    dispatch,
    state.fields.exitWeight.value,
    state.fields.rigs.value,
    state.original,
    state.original?.id,
  ]);

  return (
    <>
      <TextInput
        style={styles.field}
        label="Name"
        error={state.fields.name.error}
        value={state.fields.name?.value?.toString() || ''}
        onChange={(newValue) => dispatch(actions.forms.user.setField(['name', newValue]))}
      />

      <HelperText type={state.fields.name.error ? 'error' : 'info'}>
        {state.fields.name.error || ' '}
      </HelperText>

      <TextInput
        style={styles.field}
        label="Nickname"
        error={state.fields.nickname.error}
        value={state.fields.nickname?.value?.toString() || ''}
        onChange={(newValue) => dispatch(actions.forms.user.setField(['nickname', newValue]))}
      />

      <HelperText type={state.fields.nickname.error ? 'error' : 'info'}>
        {state.fields.nickname.error || ' '}
      </HelperText>

      <TextInput
        style={styles.field}
        label="Email"
        error={state.fields.email.error}
        value={state.fields.email?.value?.toString() || ''}
        onChange={(newValue) => dispatch(actions.forms.user.setField(['email', newValue]))}
      />

      <TextInput
        style={styles.field}
        label="Phone"
        error={state.fields.phone.error}
        value={state.fields.phone?.value?.toString() || ''}
        onChange={(newValue) => dispatch(actions.forms.user.setField(['phone', newValue]))}
      />

      <NumberField
        value={!state.fields.exitWeight.value ? 0 : Number(state.fields.exitWeight.value)}
        error={state.fields.exitWeight.error}
        onChange={(num) => dispatch(actions.forms.user.setField(['exitWeight', num.toString()]))}
        label="Exit weight (kg)"
      />

      <Divider />

      <View style={{ width: '100%' }}>
        <FederationSelect
          value={state?.fields?.license?.value?.federation || state.federation.value}
          onChange={(value) => dispatch(actions.forms.user.setFederation(value))}
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
              onChange={(value) => dispatch(actions.forms.user.setField(['license', value]))}
            />
            <HelperText type={state.fields.license.error ? 'error' : 'info'}>
              {state.fields.license.error || ''}
            </HelperText>
          </>
        )}
      </View>
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
