import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { TextInput, HelperText, Checkbox, Menu, List, Divider } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../../../redux';


import slice from "./slice";
import PlaneSelect from '../../PlaneSelect';
import DropzoneUserSelect from '../../DropzoneUserSelect';

const { actions } = slice;



export default function LoadForm() {
  const state = useAppSelector(state => state.loadForm);
  const dispatch = useAppDispatch();
  const globalState = useAppSelector(state => state.global);


  return ( 
    <ScrollView style={styles.fields} contentContainerStyle={{ paddingTop: 200 }}>
      
      <TextInput
        style={styles.field}
        mode="outlined"
        label="Name"
        error={!!state.fields.name.error}
        value={state.fields.name.value || ""}
        onChangeText={(newValue) => dispatch(actions.setField(["name", newValue]))}
      />
      <HelperText type={!!state.fields.name.error ? "error" : "info"}>
        { state.fields.name.error || "" }
      </HelperText>

      <PlaneSelect
        value={state.fields.plane.value}
        onSelect={(value) => {
          dispatch(actions.setField(["plane", value]));
          dispatch(actions.setField(["maxSlots", value.maxSlots]));
        }}
        dropzoneId={Number(globalState.currentDropzone?.id)}
      />
      <HelperText type={!!state.fields.plane.error ? "error" : "info"}>
        { state.fields.plane.error || "" }
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Slots"
        error={!!state.fields.maxSlots.value}
        value={state.fields.maxSlots?.value?.toString()}
        onChangeText={(newValue) => dispatch(actions.setField(["maxSlots", Number(newValue)]))}
      />
      <HelperText type={!!state.fields.maxSlots.error ? "error" : "info"}>
        { state.fields.maxSlots.error || "" }
      </HelperText>

      
      <Checkbox.Item
        label="Allow public manifesting"
        status={!!state.fields.isOpen.value
          ? "checked"
          : "unchecked"
        }
        onPress={
          () => dispatch(actions.setField(["isOpen", !state.fields.isOpen.value]))
        }
      />

      <Divider />
      <DropzoneUserSelect
        label="GCA"
        onSelect={dzUser => dispatch(actions.setField(["gca", dzUser]))}
        dropzoneId={Number(globalState.currentDropzone?.id)}
        value={state.fields.gca.value || null}
        requiredPermissions={["actAsGCA"]}
        required
      />
      <HelperText type={!!state.fields.gca.error ? "error" : "info"}>
        { state.fields.gca.error || "" }
      </HelperText>
      
      <DropzoneUserSelect
        label="Pilot"
        onSelect={dzUser => dispatch(actions.setField(["pilot", dzUser]))}
        dropzoneId={Number(globalState.currentDropzone?.id)}
        value={state.fields.pilot.value || null}
        requiredPermissions={["actAsPilot"]}
      />
      <HelperText type={!!state.fields.pilot.error ? "error" : "info"}>
        { state.fields.pilot.error || "" }
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
