import * as React from 'react';
import { StyleSheet } from 'react-native';
import TextInput from 'app/components/input/text/TextField';
import { actions, useAppSelector, useAppDispatch } from 'app/state';

export default function DropzoneForm() {
  const state = useAppSelector((root) => root.forms.plane);
  const dispatch = useAppDispatch();

  return (
    <>
      <TextInput
        style={styles.field}
        mode="outlined"
        label="Name"
        error={state.fields.name.error}
        value={state.fields.name?.value || ''}
        onChange={(newValue) => dispatch(actions.forms.plane.setField(['name', newValue]))}
      />

      <TextInput
        style={styles.field}
        label="Registration"
        error={state.fields.registration.error}
        value={state.fields.registration?.value || ''}
        onChange={(newValue) => dispatch(actions.forms.plane.setField(['registration', newValue]))}
      />
      <TextInput
        style={styles.field}
        label="Min slots"
        error={state.fields.minSlots.error}
        value={state.fields.minSlots.value?.toString()}
        keyboardType="number-pad"
        onChange={(newValue) =>
          dispatch(actions.forms.plane.setField(['minSlots', Number(newValue)]))
        }
      />

      <TextInput
        style={styles.field}
        label="Max slots"
        error={state.fields.maxSlots.error}
        value={state.fields.maxSlots?.value?.toString() || ''}
        keyboardType="number-pad"
        helperText="Maximum amount of jumpers who can be manifested on one load"
        onChange={(newValue) =>
          dispatch(actions.forms.plane.setField(['maxSlots', Number(newValue)]))
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    width: '100%',
    flex: 1,
  },
  field: {
    width: '100%',
    marginBottom: 8,
  },
});
