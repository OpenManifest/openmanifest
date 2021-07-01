import * as React from 'react';
import { Image, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { Button, HelperText, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { gql, useMutation } from '@apollo/client';

import { View } from '../../../components/Themed';
import { actions, useAppSelector, useAppDispatch } from '../../../redux';

import { Mutation } from '../../../graphql/schema';
import { primaryColor } from '../../../constants/Colors';
import logo from "../../../assets/images/logo.png";


const MUTATION_LOG_IN = gql`
  mutation UserLogin($email: String!, $password: String!) {
    userLogin(email: $email, password: $password) {
      authenticatable {
        id
        email
        name
        phone
        createdAt
        updatedAt
      }
      credentials {
        accessToken
        tokenType
        client
        expiry
        uid
      }
    }
  }
`;

export default function LoginScreen() {
  const state = useAppSelector(state => state.screens.login);
  const dispatch = useAppDispatch();  
  const navigation = useNavigation();
  const [mutationLogin, data] = useMutation<Mutation>(MUTATION_LOG_IN);

  const onLogin = React.useCallback(
    async () => {
      const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      let hasError = false;

      if (!state.fields.email.value) {
        hasError = true;
        dispatch(
          actions.screens.login.setEmailError("Email is required")
        );
      }

      if (!state.fields.password.value) {
        hasError = true;
        dispatch(
          actions.screens.login.setPasswordError("Password is required")
        );
      }

      if (!emailRegex.test(state.fields.email.value)) {
        hasError = true;
        dispatch(
          actions.screens.login.setEmailError("Please enter a valid email")
        );
      }

      if (!hasError) {
        try {
          const result = await mutationLogin({
            variables: {
              email: state.fields.email.value,
              password: state.fields.password.value
            }
          });

          console.log({ result });

          if (result?.data?.userLogin?.authenticatable && result?.data?.userLogin?.credentials) {
            dispatch(
              actions.global.setCredentials(result.data.userLogin.credentials)
            );
            dispatch(
              actions.global.setUser(result.data.userLogin.authenticatable)
            );
          }
        } catch (e) {
          dispatch(actions.notifications.showSnackbar({ message: e.message, variant: "error" }));
        }
      }
    },
    [mutationLogin, JSON.stringify(state.fields)],
  )

  return (
    <View style={styles.container}>
      <Image source={logo} style={{ height: 300, width: "100%" }} resizeMode="contain" />
      <KeyboardAvoidingView style={styles.fields} behavior="padding">
        <TextInput
          label="Email"
          mode="outlined"
          value={state.fields.email.value}
          onChangeText={(newValue) => {
            dispatch(actions.screens.login.setEmail(newValue));
          }}
        />
        <HelperText type="error">
          {state.fields.email.error || " "}
        </HelperText>

        <TextInput
          label="Password"
          mode="outlined"
          value={state.fields.password.value}
          secureTextEntry
          onChangeText={(newValue) => {
            dispatch(actions.screens.login.setPassword(newValue));
          }}
          error={!!state.fields.password.error}
        />
        <HelperText type="error">
          {state.fields.password.error || " "}
        </HelperText>
        <Button mode="contained" labelStyle={styles.buttonLabel} style={styles.button} onPress={onLogin} loading={data.loading}>
          Log in
        </Button>

        <Button labelStyle={styles.textButtonLabel} style={styles.textButton} onPress={() => navigation.navigate("SignUpScreen")}>
          Sign up
        </Button>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: primaryColor,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  fields: {
    marginBottom: 10,
    marginTop: -50,
    maxWidth: 400,
    width: "100%",
    paddingHorizontal: 56,
    backgroundColor: "transparent"
  },
  button: {
    marginTop: 10,
    backgroundColor: "white",
    width: "100%"
  },
  buttonLabel: {
    color: "#FF1414",
  },
  textButton: {
    marginTop: 10,
    backgroundColor: "transparent",
    color: "white",
    width: "100%"
  },
  textButtonLabel: {
    color: "#FFFFFF",
  }
});
