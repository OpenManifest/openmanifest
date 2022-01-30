import * as React from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
} from 'react-native';
import { Card, Button, HelperText, TextInput, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { TouchableOpacity } from 'react-native-gesture-handler';
import { useLoginMutation } from 'app/api/reflection';
import { actions, useAppSelector, useAppDispatch } from 'app/state';

import { primaryColor } from 'app/constants/Colors';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore PNGs are allowed
import logo from '../../../../assets/images/logo-black.png';

export default function LoginScreen() {
  const state = useAppSelector((root) => root.screens.login);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [mutationLogin, data] = useLoginMutation();
  const theme = useTheme();

  const onLogin = React.useCallback(async () => {
    // eslint-disable-next-line
    const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailRegex = new RegExp(pattern);
    let hasError = false;

    if (!state.fields.email.value) {
      hasError = true;
      dispatch(actions.screens.login.setEmailError('Email is required'));
    }

    if (!state.fields.password.value) {
      hasError = true;
      dispatch(actions.screens.login.setPasswordError('Password is required'));
    }

    if (!emailRegex.test(state.fields.email.value)) {
      hasError = true;
      dispatch(actions.screens.login.setEmailError('Please enter a valid email'));
    }

    if (!hasError) {
      try {
        const result = await mutationLogin({
          variables: {
            email: state.fields.email.value,
            password: state.fields.password.value,
          },
        });

        if (result?.data?.userLogin?.authenticatable && result?.data?.userLogin?.credentials) {
          dispatch(actions.global.setCredentials(result.data.userLogin.credentials));
          dispatch(actions.global.setUser(result.data.userLogin.authenticatable));
        }
      } catch (e) {
        if (e instanceof Error) {
          dispatch(
            actions.notifications.showSnackbar({
              message: e.message,
              variant: 'error',
            })
          );
        }
      }
    }
  }, [dispatch, mutationLogin, state.fields.email.value, state.fields.password.value]);

  return (
    <ImageBackground
      // eslint-disable-next-line global-require
      source={require('assets/images/pattern.png')}
      style={styles.container}
      resizeMode="repeat"
    >
      <Image source={logo} style={{ height: 300, width: '100%' }} resizeMode="contain" />
      <KeyboardAvoidingView
        style={styles.fields}
        behavior={Platform.OS === 'android' ? undefined : 'padding'}
      >
        <Card style={{ padding: 16, borderRadius: 8 }} elevation={3}>
          <Card.Content>
            <TextInput
              label="Email"
              mode="outlined"
              value={state.fields.email.value}
              onChangeText={(newValue) => {
                dispatch(actions.screens.login.setEmail(newValue));
              }}
            />
            <HelperText type="error">{state.fields.email.error}</HelperText>

            <TextInput
              label="Password"
              mode="outlined"
              value={state.fields.password.value}
              secureTextEntry
              onChangeText={(newValue) => {
                dispatch(actions.screens.login.setPassword(newValue));
              }}
              onSubmitEditing={onLogin}
              error={!!state.fields.password.error}
            />

            <HelperText type="error">{state.fields.password.error || ' '}</HelperText>
            <Button
              mode="contained"
              labelStyle={styles.buttonLabel}
              style={[styles.button, { backgroundColor: theme.colors.surface }]}
              onPress={onLogin}
              loading={data.loading}
            >
              Log in
            </Button>

            <Button
              labelStyle={styles.textButtonLabel}
              style={styles.textButton}
              onPress={() => navigation.navigate('Unauthenticated', { screen: 'SignUpWizard' })}
            >
              Sign up
            </Button>
            <TouchableOpacity
              onPress={() => navigation.navigate('Wizards', { screen: 'RecoverPasswordScreen' })}
            >
              <Text style={theme.dark ? styles.forgotPasswordDark : styles.forgotPassword}>
                Forgot your password?
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: primaryColor,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  forgotPassword: {
    color: 'rgb(50, 50, 50)',
  },
  forgotPasswordDark: {
    color: 'rgb(180, 180, 180)',
  },

  fields: {
    marginBottom: 10,
    marginTop: -50,
    maxWidth: 400,
    width: '100%',
    paddingHorizontal: 56,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 10,
    backgroundColor: 'white',
    borderColor: primaryColor,
    borderWidth: 1,
    width: '100%',
  },
  buttonLabel: {
    color: '#FF1414',
  },
  textButton: {
    marginTop: 10,
    height: 56,
    backgroundColor: 'transparent',
    color: 'white',
    width: '100%',
  },
  textButtonLabel: {
    // color: '#FFFFFF',
  },
});
