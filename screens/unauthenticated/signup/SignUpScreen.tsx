import * as React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useAppSelector, useAppDispatch } from '../../../redux';

import { Text, View } from '../../../components/Themed';
import { actions as snackbar } from "../../../components/notifications";
import globalSlice from "../../../redux/global";

import slice from "./slice";
import useMutationSignUp from '../../../graphql/hooks/useMutationSignUp';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';

const { actions } = slice;
const { actions: globalActions } = globalSlice;


export default function SignupScreen() {
  const state = useAppSelector(state => state.signup);
  const dispatch = useAppDispatch();

  const { loading, mutate: onSignUp } = useMutationSignUp({
    onSuccess: (payload) => {
      if (payload.credentials) {
        dispatch(
          globalActions.setCredentials(payload.credentials)
        );
        dispatch(
          globalActions.setUser(payload.authenticatable!)
        );
      }
    },
    onFieldError: (field, value) =>
      dispatch(
        actions.setFieldError([field as any, value])
      )
  });

  

  return (
    <ScrollableScreen contentContainerStyle={{ padding: 48, alignItems: "center" }}>
      <Text style={styles.title}>Sign up</Text>
      <View style={styles.fields}>
        <TextInput
          style={styles.field}
          mode="outlined"
          label="Name"
          error={!!state.fields.name.error}
          value={state.fields.name.value}
          onChangeText={(newValue) => dispatch(actions.setField(["name", newValue]))}
        />
        <HelperText type="error">
          { state.fields.name.error || "" }
        </HelperText>

        <TextInput
          style={styles.field}
          mode="outlined"
          label="Exit weight"
          error={!!state.fields.exitWeight.error}
          value={state.fields.exitWeight?.value?.toString() || ""}
          keyboardType="numbers-and-punctuation"
          right={() => <TextInput.Affix text="kg" />}
          onChangeText={(newValue) =>
            !newValue || /\d+/.test(newValue) ? dispatch(actions.setField(["exitWeight", parseFloat(newValue || "0")])) : null
          }
        />
        
        <HelperText type={!!state.fields.exitWeight.error ? "error" : "info"}>
          { state.fields.exitWeight.error || "" }
        </HelperText>

        <TextInput
          style={styles.field}
          mode="outlined"
          label="Email"
          error={!!state.fields.email.error}
          value={state.fields.email.value}
          onChangeText={(newValue) => dispatch(actions.setField(["email", newValue]))}
        />

        <HelperText type="error">
          { state.fields.email.error || "" }
        </HelperText>

        <TextInput
          style={styles.field}
          mode="outlined"
          label="Phone"
          error={!!state.fields.phone.error}
          value={state.fields.phone.value}
          onChangeText={(newValue) => dispatch(actions.setField(["phone", newValue]))}
        />
        <HelperText type="error">
          { state.fields.phone.error || "" }
        </HelperText>

        <TextInput
          style={styles.field}
          mode="outlined"
          label="Password"
          error={Boolean(state.fields.password.error || state.fields.passwordConfirmation.error)}
          textContentType="password"
          secureTextEntry
          passwordRules="required: upper; required: lower; required: digit; minlength: 8;"
          value={state.fields.password.value}
          onChangeText={(newValue) => dispatch(actions.setField(["password", newValue]))}
        />

        <HelperText type="error">
          { state.fields.password.error || "" }
        </HelperText>

        <TextInput
          style={styles.field}
          mode="outlined"
          label="Repeat password"
          error={Boolean(state.fields.password.error || state.fields.passwordConfirmation.error)}
          textContentType="password"
          secureTextEntry
          passwordRules="required: upper; required: lower; required: digit; minlength: 8;"
          value={state.fields.passwordConfirmation.value}
          onChangeText={(newValue) => dispatch(actions.setField(["passwordConfirmation", newValue]))}
        />
        <HelperText type="error">
          { state.fields.passwordConfirmation.error || "" }
        </HelperText>

        <Button
          mode="contained"
          onPress={() =>
            onSignUp({
              email: state.fields.email.value,
              name: state.fields.name.value,
              exitWeight: state.fields.exitWeight.value,
              password: state.fields.password.value,
              passwordConfirmation: state.fields.passwordConfirmation.value,
              licenseId: Number(state.fields.license?.value?.id) || null,
              phone: state.fields.phone.value,
            })
          }
          loading={loading}
        >
          Sign up
        </Button>
      </View>
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  fields: {
    width: "100%",
    maxWidth: 400,
  },
  field: {
    marginBottom: 8,
  }
});
