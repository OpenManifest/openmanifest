import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Button, HelperText, TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { gql, useMutation } from '@apollo/client';

import { Text, View } from '../../../components/Themed';
import { useAppSelector, useAppDispatch, globalActions, snackbarActions } from '../../../redux';

import slice from "./slice";
import { Mutation } from '../../../graphql/schema';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';

const { actions } = slice;

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
  const state = useAppSelector(state => state.login);
  const dispatch = useAppDispatch();  
  const navigation = useNavigation();
  const [mutationLogin, data] = useMutation<Mutation>(MUTATION_LOG_IN);

  const onLogin = useCallback(
    async () => {
      const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
      let hasError = false;

      if (!state.fields.email.value) {
        hasError = true;
        dispatch(
          actions.setEmailError("Email is required")
        );
      }

      if (!state.fields.password.value) {
        hasError = true;
        dispatch(
          actions.setPasswordError("Password is required")
        );
      }

      if (!emailRegex.test(state.fields.email.value)) {
        hasError = true;
        dispatch(
          actions.setEmailError("Please enter a valid email")
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
              globalActions.setCredentials(result.data.userLogin.credentials)
            );
            dispatch(
              globalActions.setUser(result.data.userLogin.authenticatable)
            );
          }
        } catch (e) {
          dispatch(snackbarActions.showSnackbar({ message: e.message, variant: "error" }));
        }
      }
    },
    [mutationLogin, JSON.stringify(state.fields)],
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>

      <View style={styles.fields}>
        <TextInput
          label="Email"
          mode="outlined"
          value={state.fields.email.value}
          onChangeText={(newValue) => {
            dispatch(actions.setEmail(newValue));
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
            dispatch(actions.setPassword(newValue));
          }}
          error={!!state.fields.password.error}
        />
        <HelperText type="error">
          {state.fields.password.error || " "}
        </HelperText>
        <Button mode="contained" style={styles.button} onPress={onLogin} loading={data.loading}>
          Log in
        </Button>

        <Button style={styles.button} onPress={() => navigation.navigate("SignUpScreen")}>
          Sign up
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 10,
    width: "100%",
    padding: 96,
  },
  button: {
    marginTop: 10,
    width: "100%"
  }
});
