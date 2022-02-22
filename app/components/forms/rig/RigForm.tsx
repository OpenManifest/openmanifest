import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import TextInput from 'app/components/input/text/TextField';
import { HelperText } from 'react-native-paper';

import { actions, useAppSelector, useAppDispatch } from '../../../state';

import DatePicker from '../../input/date_picker/DatePicker';
import ChipSelect from '../../input/chip_select/ChipSelect';
import useRestriction from '../../../hooks/useRestriction';
import { Permission } from '../../../api/schema.d';

interface IRigForm {
  showTypeSelect?: boolean;
}
export default function RigForm(props: IRigForm) {
  const { showTypeSelect } = props;
  const state = useAppSelector((root) => root.forms.rig);
  const dispatch = useAppDispatch();

  const canCreateRigs = useRestriction(Permission.CreateRig);

  return (
    <View>
      <TextInput
        style={styles.field}
        label="Name"
        error={state.fields.name.error}
        value={state.fields.name.value || ''}
        helperText="You can give your equipment a nickname"
        onChange={(newValue) => dispatch(actions.forms.rig.setField(['name', newValue]))}
      />

      <TextInput
        style={styles.field}
        label="Make"
        helperText="e.g Javelin, Mirage"
        error={state.fields.make.error}
        value={state.fields.make.value || ''}
        onChange={(newValue) => dispatch(actions.forms.rig.setField(['make', newValue]))}
      />

      <TextInput
        style={styles.field}
        label="Model"
        error={state.fields.model.error}
        value={state.fields.model.value || ''}
        onChangeText={(newValue) => dispatch(actions.forms.rig.setField(['model', newValue]))}
      />
      <HelperText type={state.fields.model.error ? 'error' : 'info'}>
        {state.fields.model.error || 'e.g G4.1'}
      </HelperText>

      <TextInput
        style={styles.field}
        label="Serial"
        error={state.fields.serial.error}
        value={state.fields.serial.value || ''}
        onChangeText={(newValue) => dispatch(actions.forms.rig.setField(['serial', newValue]))}
      />
      <HelperText type={state.fields.serial.error ? 'error' : 'info'}>
        {state.fields.serial.error || ''}
      </HelperText>

      <TextInput
        style={styles.field}
        label="Current canopy size"
        error={state.fields.canopySize.error}
        value={state.fields.canopySize.value?.toString() || ''}
        keyboardType="number-pad"
        onChangeText={(newValue) =>
          dispatch(actions.forms.rig.setField(['canopySize', Number(newValue)]))
        }
      />
      <HelperText type={state.fields.canopySize.error ? 'error' : 'info'}>
        {state.fields.canopySize.error || 'Size of canopy in container'}
      </HelperText>

      {!showTypeSelect ? null : (
        <ChipSelect<string>
          items={['student', 'sport', 'tandem']}
          renderItemLabel={(item) => item}
          isDisabled={(item) => (!canCreateRigs ? item !== 'sport' : false)}
          selected={[state.fields.rigType?.value || 'sport']}
          onChangeSelected={([rigType]) =>
            dispatch(actions.forms.rig.setField(['rigType', rigType]))
          }
        />
      )}
      <DatePicker
        timestamp={state.fields.repackExpiresAt.value || new Date().getTime() / 1000}
        onChange={(time) => dispatch(actions.forms.rig.setField(['repackExpiresAt', time]))}
        label="Reserve repack expiry date"
      />
      <HelperText type={state.fields.repackExpiresAt.error ? 'error' : 'info'}>
        {state.fields.repackExpiresAt.error || ''}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  fields: {
    flex: 1,
  },
  field: {
    marginBottom: 8,
  },
});
