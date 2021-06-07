import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';

import { actions, useAppSelector, useAppDispatch } from '../../../redux';

import DatePicker from '../../input/date_picker/DatePicker';
import ChipSelect from '../../input/chip_select/ChipSelect';
import useRestriction from '../../../hooks/useRestriction';


interface IRigForm {
  showTypeSelect?: boolean;
}
export default function RigForm(props: IRigForm) {
  const state = useAppSelector(state => state.forms.rig);
  const dispatch = useAppDispatch();

  const canCreateRigs = useRestriction("createRig");

  return ( 
    <View>
      <TextInput
        style={styles.field}
        mode="outlined"
        label="Make"
        error={!!state.fields.make.error}
        value={state.fields.make.value || ""}
        onChangeText={(newValue) => dispatch(actions.forms.rig.setField(["make", newValue]))}
      />
      <HelperText type={!!state.fields.make.error ? "error" : "info"}>
        { state.fields.make.error || "e.g Javelin, Mirage" }
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Model"
        error={!!state.fields.model.error}
        value={state.fields.model.value || ""}
        onChangeText={(newValue) => dispatch(actions.forms.rig.setField(["model", newValue]))}
      />
      <HelperText type={!!state.fields.model.error ? "error" : "info"}>
        { state.fields.model.error || "e.g G4.1" }
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Serial"
        error={!!state.fields.serial.error}
        value={state.fields.serial.value || ""}
        onChangeText={(newValue) => dispatch(actions.forms.rig.setField(["serial", newValue]))}
      />
      <HelperText type={!!state.fields.serial.error ? "error" : "info"}>
        { state.fields.serial.error || "" }
      </HelperText>

      

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Current canopy size"
        error={!!state.fields.canopySize.error}
        value={state.fields.canopySize.value?.toString() || ""}
        keyboardType="number-pad"
        onChangeText={(newValue) => dispatch(actions.forms.rig.setField(["canopySize", Number(newValue)]))}
      />
      <HelperText type={!!state.fields.canopySize.error ? "error" : "info"}>
        { state.fields.canopySize.error || "Size of canopy in container" }
      </HelperText>

      { !props.showTypeSelect ? null : (
        <ChipSelect
          items={["student", "sport", "tandem"]}
          renderItemLabel={(item) => item}
          isDisabled={(item) => !canCreateRigs ? item !== "sport" : false}
          selected={[state.fields.rigType?.value || "sport"]}
          onChangeSelected={([rigType]) =>
            dispatch(actions.forms.rig.setField(["rigType", rigType]))
          }
        />
      )}
      <DatePicker
        timestamp={state.fields.repackExpiresAt.value || new Date().getTime() / 1000}
        onChange={(time) => dispatch(actions.forms.rig.setField(["repackExpiresAt", time]))}
        label="Reserve repack expiry date"
      />
      <HelperText type={!!state.fields.repackExpiresAt.error ? "error" : "info"}>
        { state.fields.repackExpiresAt.error || "" }
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
  }
});
