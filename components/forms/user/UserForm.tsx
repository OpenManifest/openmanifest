import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { TextInput, HelperText, Divider, Chip, List } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../../../redux';


import slice from "./slice";
import LicenseChipSelect from '../../LicenseChipSelect';
import FederationSelect from '../../FederationSelect';
import { License } from '../../../graphql/schema';

const { actions } = slice;
export default function SlotForm() {
  const state = useAppSelector(state => state.userForm);
  const dispatch = useAppDispatch();
  const globalState = useAppSelector(state => state.global);

  React.useEffect(() => {
    if (state.original) {
      if (!state.fields.exitWeight.value) {
        dispatch(
          actions.setField(["exitWeight", state.original.exitWeight || "60"])
        );
      }

      if (!state.fields.rigs.value && state.original?.id) {
        dispatch(
          actions.setField(["rigs", state.original.rigs])
        );
      }

    }
  }, [state.original?.id]);

  const isEdit = state?.original?.id;
  const isSelf = state?.original?.id === globalState.currentUser?.id;  


  return ( 
    <>
      <TextInput
        style={styles.field}
        mode="outlined"
        label="Name"
        error={!!state.fields.name.error}
        value={state.fields.name?.value?.toString() || ""}
        onChangeText={(newValue) => dispatch(actions.setField(["name", newValue]))}
      />
      
      <HelperText type={!!state.fields.name.error ? "error" : "info"}>
        { state.fields.name.error || " " }
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Email"
        error={!!state.fields.email.error}
        value={state.fields.email?.value?.toString() || ""}
        onChangeText={(newValue) => dispatch(actions.setField(["email", newValue]))}
      />
      
      <HelperText type={!!state.fields.email.error ? "error" : "info"}>
        { state.fields.email.error || " " }
      </HelperText>

      <TextInput
        style={styles.field}
        mode="outlined"
        label="Phone"
        error={!!state.fields.phone.error}
        value={state.fields.phone?.value?.toString() || ""}
        onChangeText={(newValue) => dispatch(actions.setField(["phone", newValue]))}
      />
      
      <HelperText type={!!state.fields.phone.error ? "error" : "info"}>
        { state.fields.phone.error || "" }
      </HelperText>

      
      
     <TextInput
        style={styles.field}
        mode="outlined"
        label="Exit weight"
        error={!!state.fields.exitWeight.error}
        value={state.fields.exitWeight?.value?.toString() || ""}
        keyboardType="numbers-and-punctuation"
        right={() => <TextInput.Affix text="kg" />}
        onChangeText={(newValue) => dispatch(actions.setField(["exitWeight", newValue]))}
      />
      
      <HelperText type={!!state.fields.exitWeight.error ? "error" : "info"}>
        { state.fields.exitWeight.error || "" }
      </HelperText>

      <Divider />

      <View style={{ width: "100%"}}>
        <FederationSelect
          value={state?.fields?.license?.value?.federation || state.federation.value}
          onSelect={(value) => dispatch(actions.setFederation(value))}
          required
        />

        <HelperText type={!!state.federation.error ? "error" : "info"}>
          { state.federation.error || "" }
        </HelperText>

        { (state?.fields?.license?.value?.federation?.id || state?.federation?.value?.id) && (
          <>
            <LicenseChipSelect
              value={state.fields.license.value}
              federationId={Number(state?.fields?.license?.value?.federation?.id || state.federation?.value?.id)}
              onSelect={(value) => dispatch(actions.setField(["license", value]))}
              required
            />
            <HelperText type={!!state.fields.license.error ? "error" : "info"}>
              { state.fields.license.error || "" }
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
    width: "100%",
    paddingTop: 32,
  },
  field: {
    marginBottom: 8,
    width: "100%",
  },
  ticketAddons: {
    marginBottom: 8
  }
});
