import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';

import { useAppSelector, useAppDispatch } from '../../../redux';

import slice from "./slice";
import DatePicker from '../../DatePicker';

const { actions } = slice;

export default function RigForm() {
  const state = useAppSelector(state => state.rigForm);
  const dispatch = useAppDispatch();

  return ( 
    <View>
      <TextInput
        style={styles.field}
        mode="outlined"
        label="Make"
        error={!!state.fields.make.error}
        value={state.fields.make.value || ""}
        onChangeText={(newValue) => dispatch(actions.setField(["make", newValue]))}
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
        onChangeText={(newValue) => dispatch(actions.setField(["model", newValue]))}
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
        onChangeText={(newValue) => dispatch(actions.setField(["serial", newValue]))}
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
        onChangeText={(newValue) => dispatch(actions.setField(["canopySize", Number(newValue)]))}
      />
      <HelperText type={!!state.fields.canopySize.error ? "error" : "info"}>
        { state.fields.canopySize.error || "Size of canopy in container" }
      </HelperText>

      <DatePicker
        timestamp={state.fields.repackExpiresAt.value || new Date().getTime() / 1000}
        onChange={(time) => dispatch(actions.setField(["repackExpiresAt", time]))}
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
