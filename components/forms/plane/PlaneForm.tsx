import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../../../redux';


import slice from "./slice";

const { actions } = slice;


export default function DropzoneForm() {
  const state = useAppSelector(state => state.planeForm);
  const dispatch = useAppDispatch();

  return ( 
    <ScrollView style={styles.fields} contentContainerStyle={{ paddingTop: 200 }}>
      <TextInput
        style={styles.field}
        mode="outlined"
        label="Name"
        error={!!state.fields.name.error}
        value={state.fields.name.value}
        onChangeText={(newValue) => dispatch(actions.setField(["name", newValue]))}
      />
      <HelperText type={!!state.fields.name.error ? "error" : "info"}>
        { state.fields.name.error || "" }
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Registration"
        error={!!state.fields.registration.error}
        value={state.fields.registration.value}
        onChangeText={(newValue) => dispatch(actions.setField(["registration", newValue]))}
      />
      <HelperText type={!!state.fields.registration.error ? "error" : "info"}>
        { state.fields.registration.error || "" }
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="hours"
        error={!!state.fields.hours.error}
        value={state.fields.hours?.value?.toString()}
        placeholder="Optional"
        onChangeText={(newValue) => dispatch(actions.setField(["hours", Number(newValue)]))}
      />
      <HelperText type={!!state.fields.hours.error ? "error" : "info"}>
        { state.fields.hours.error || "" }
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Min slots"
        error={!!state.fields.minSlots.error}
        value={state.fields.minSlots.value?.toString()}
        keyboardType="number-pad"
        onChangeText={(newValue) => dispatch(actions.setField(["minSlots", Number(newValue)]))}
      />
      <HelperText type={!!state.fields.minSlots.error ? "error" : "info"}>
        { state.fields.minSlots.error || "Minimum tickets required to send it" }
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Max slots"
        error={!!state.fields.maxSlots.error}
        value={state.fields.maxSlots?.value.toString()}
        keyboardType="number-pad"
        onChangeText={(newValue) => dispatch(actions.setField(["maxSlots", Number(newValue)]))}
      />
      <HelperText type={!!state.fields.maxSlots.error ? "error" : "info"}>
        { state.fields.maxSlots.error || "Maximum amount of jumpers who can be manifested on one load" }
      </HelperText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fields: {
    width: "70%",
    flex: 1,
    
  },
  field: {
    marginBottom: 8,
  }
});
