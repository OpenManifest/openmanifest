import * as React from 'react';
import { Permission } from 'app/api/schema.d';
import { StyleSheet, View } from 'react-native';
import TextInput from 'app/components/input/text/TextField';
import { HelperText, Checkbox, Divider } from 'react-native-paper';
import { actions, useAppSelector, useAppDispatch } from '../../../state';

import DropzoneUserChipSelect from '../../input/chip_select/DropzoneUserChipSelect';
import PlaneChipSelect from '../../input/chip_select/PlaneChipSelect';

export default function LoadForm() {
  const state = useAppSelector((root) => root.forms.load);
  const dispatch = useAppDispatch();

  return (
    <>
      <TextInput
        style={styles.field}
        label="Name"
        error={state.fields.name.error}
        placeholder="Optional"
        value={state.fields.name.value || ''}
        onChange={(newValue) => dispatch(actions.forms.load.setField(['name', newValue]))}
      />

      <TextInput
        style={styles.field}
        label="Slots"
        error={state.fields.maxSlots.error}
        value={state.fields.maxSlots?.value?.toString()}
        onChange={(newValue) =>
          dispatch(actions.forms.load.setField(['maxSlots', Number(newValue)]))
        }
      />
      <View style={{ width: '100%' }}>
        <PlaneChipSelect
          value={state.fields.plane.value}
          onSelect={(value) => {
            dispatch(actions.forms.load.setField(['plane', value]));
            dispatch(actions.forms.load.setField(['maxSlots', value.maxSlots]));
          }}
        />
        <HelperText type={state.fields.plane.error ? 'error' : 'info'}>
          {state.fields.plane.error || ''}
        </HelperText>

        <DropzoneUserChipSelect
          label="GCA"
          onSelect={(dzUser) => dispatch(actions.forms.load.setField(['gca', dzUser]))}
          value={state.fields.gca.value || null}
          requiredPermissions={[Permission.ActAsGca]}
        />
        <HelperText type={state.fields.gca.error ? 'error' : 'info'}>
          {state.fields.gca.error || ''}
        </HelperText>

        <DropzoneUserChipSelect
          label="Pilot"
          onSelect={(dzUser) => dispatch(actions.forms.load.setField(['pilot', dzUser]))}
          value={state.fields.pilot.value || null}
          requiredPermissions={[Permission.ActAsPilot]}
        />
        <HelperText type={state.fields.pilot.error ? 'error' : 'info'}>
          {state.fields.pilot.error || ''}
        </HelperText>

        <Divider style={{ marginVertical: 8 }} />

        <Checkbox.Item
          label="Allow public manifesting"
          status={state.fields.isOpen.value ? 'checked' : 'unchecked'}
          onPress={() =>
            dispatch(actions.forms.load.setField(['isOpen', !state.fields.isOpen.value]))
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    flex: 1,
    width: '100%',
  },
  field: {
    marginBottom: 8,
    width: '100%',
    backgroundColor: 'white',
  },
});
