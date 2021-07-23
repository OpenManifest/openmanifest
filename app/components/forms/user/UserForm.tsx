import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText, Divider } from 'react-native-paper';
import { actions, useAppSelector, useAppDispatch } from '../../../state';


import LicenseChipSelect from '../../input/chip_select/LicenseChipSelect';
import FederationSelect from '../../input/dropdown_select/FederationSelect';
export default function SlotForm() {
  const state = useAppSelector(state => state.forms.user);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    if (state.original) {
      if (!state.fields.exitWeight.value) {
        dispatch(
          actions.forms.user.setField(["exitWeight", state.original.exitWeight || "60"])
        );
      }

      if (!state.fields.rigs.value && state.original?.id) {
        dispatch(
          actions.forms.user.setField(["rigs", state.original.rigs])
        );
      }

    }
  }, [state.original?.id]);

  return ( 
    <>
      <TextInput
        style={styles.field}
        mode="outlined"
        label="Name"
        error={!!state.fields.name.error}
        value={state.fields.name?.value?.toString() || ""}
        onChangeText={(newValue) => dispatch(actions.forms.user.setField(["name", newValue]))}
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
        onChangeText={(newValue) => dispatch(actions.forms.user.setField(["email", newValue]))}
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
        onChangeText={(newValue) => dispatch(actions.forms.user.setField(["phone", newValue]))}
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
        onChangeText={(newValue) => dispatch(actions.forms.user.setField(["exitWeight", newValue]))}
      />
      
      <HelperText type={!!state.fields.exitWeight.error ? "error" : "info"}>
        { state.fields.exitWeight.error || "" }
      </HelperText>

      <Divider />

      <View style={{ width: "100%"}}>
        <FederationSelect
          value={state?.fields?.license?.value?.federation || state.federation.value}
          onSelect={(value) => dispatch(actions.forms.user.setFederation(value))}
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
              onSelect={(value) => dispatch(actions.forms.user.setField(["license", value]))}
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
