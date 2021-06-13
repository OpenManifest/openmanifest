import * as React from 'react';
import { Image, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { actions, useAppSelector, useAppDispatch } from '../../../redux';

import { Text, View } from '../../../components/Themed';
import useMutationSignUp from '../../../graphql/hooks/useMutationSignUp';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';

import { primaryColor } from '../../../constants/Colors';
import logo from "../../../assets/images/logo.png";

export default function SignupScreen() {
  const state = useAppSelector(state => state.screens.signup);
  const dispatch = useAppDispatch();

  const { loading, mutate: onSignUp } = useMutationSignUp({
    onSuccess: (payload) => {
      if (payload.credentials) {
        dispatch(
          actions.global.setCredentials(payload.credentials)
        );
        dispatch(
          actions.global.setUser(payload.authenticatable!)
        );
      }
    },
    onFieldError: (field, value) =>
      dispatch(
        actions.screens.signup.setFieldError([field as any, value])
      )
  });

  

  return (
    <ScrollableScreen style={styles.container} contentContainerStyle={styles.content}>
      <Image source={logo} style={{ width: "100%", height: 200 }} resizeMode="contain" />
      <View style={styles.fields}>
        <TextInput
          style={styles.field}
          mode="outlined"
          label="Name"
          error={!!state.fields.name.error}
          value={state.fields.name.value}
          onChangeText={(newValue) => dispatch(actions.screens.signup.setField(["name", newValue]))}
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
            !newValue || /\d+/.test(newValue) ? dispatch(actions.screens.signup.setField(["exitWeight", parseFloat(newValue || "0")])) : null
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
          onChangeText={(newValue) => dispatch(actions.screens.signup.setField(["email", newValue]))}
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
          onChangeText={(newValue) => dispatch(actions.screens.signup.setField(["phone", newValue]))}
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
          onChangeText={(newValue) => dispatch(actions.screens.signup.setField(["password", newValue]))}
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
          onChangeText={(newValue) => dispatch(actions.screens.signup.setField(["passwordConfirmation", newValue]))}
        />
        <HelperText type="error">
          { state.fields.passwordConfirmation.error || "" }
        </HelperText>

        <Button
          mode="contained"
          labelStyle={styles.buttonLabel} 
          style={styles.button}
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
    backgroundColor: primaryColor,
  },
  content: {
    paddingHorizontal: 60,
  },
  button: {
    marginTop: 10,
    backgroundColor: "white",
    width: "100%"
  },
  buttonLabel: {
    color: "#FF1414",
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
    backgroundColor: "transparent"
  },
  field: {
    marginBottom: 8,
    backgroundColor: "pink",
    borderColor: "white",
    color: "white"
  }
});
