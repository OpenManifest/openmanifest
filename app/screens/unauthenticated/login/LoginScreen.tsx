import * as React from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Card, Button, HelperText, TextInput, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { TouchableOpacity } from 'react-native-gesture-handler';
import { useLoginMutation } from 'app/api/reflection';
import { actions, useAppSelector, useAppDispatch } from 'app/state';

import { primaryColor } from 'app/constants/Colors';
import Divider from 'app/components/Divider';

import LottieView from 'app/components/LottieView';
import FacebookButton, { useLoginWithFacebook } from './FacebookButton';
import AppleButton, { useLoginWithApple } from './AppleButton';
import logoDark from '../../../../assets/images/logo-black.png';
import logoLight from '../../../../assets/images/logo-white.png';

export default function LoginScreen() {
  const state = useAppSelector((root) => root.screens.login);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const [mutationLogin, data] = useLoginMutation();
  const [loginWithFacebook, loginWithFacebookMutation] = useLoginWithFacebook();
  const [loginWithApple, loginWithAppleMutation] = useLoginWithApple();
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

  const loading =
    loginWithFacebookMutation?.loading || data?.loading || loginWithAppleMutation?.loading;
  return (
    <ImageBackground
      source={
        theme.dark
          ? // eslint-disable-next-line global-require
            require('assets/images/webb-dark.png')
          : // eslint-disable-next-line global-require
            require('assets/images/pattern.png')
      }
      style={styles.container}
      resizeMode="repeat"
    >
      <Image source={theme.dark ? logoLight : logoDark} style={styles.logo} resizeMode="contain" />
      <KeyboardAvoidingView
        style={styles.fields}
        behavior={Platform.OS === 'android' ? undefined : 'padding'}
      >
        <Card style={styles.card} elevation={3}>
          <Card.Content>
            {loading ? (
              <View style={styles.animationContainer}>
                <LottieView
                  autoPlay
                  loop
                  style={styles.loadingAnimation}
                  // eslint-disable-next-line global-require
                  source={require('../../../../assets/images/loading.json')}
                />
              </View>
            ) : (
              <>
                <TextInput
                  label="Email"
                  mode="outlined"
                  value={state.fields.email.value}
                  disabled={loading}
                  onChangeText={(newValue) => {
                    dispatch(actions.screens.login.setEmail(newValue));
                  }}
                />
                <HelperText type="error">{state.fields.email.error}</HelperText>

                <TextInput
                  label="Password"
                  mode="outlined"
                  disabled={loading}
                  value={state.fields.password.value}
                  secureTextEntry
                  onChangeText={(newValue) => {
                    dispatch(actions.screens.login.setPassword(newValue));
                  }}
                  onSubmitEditing={onLogin}
                  error={!!state.fields.password.error}
                />

                <HelperText type="error">{state.fields.password.error || ' '}</HelperText>
              </>
            )}
            <Button
              mode="contained"
              disabled={loading}
              labelStyle={{ color: theme.colors.onSurface }}
              style={[
                styles.button,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.surface },
              ]}
              onPress={onLogin}
            >
              {loading ? 'Authenticating...' : 'Log in'}
            </Button>

            <Divider>or</Divider>
            <FacebookButton
              disabled={loading}
              style={{ marginTop: 8 }}
              onPress={loginWithFacebook}
            />

            <AppleButton onPress={loginWithApple} style={{ width: '100%', flex: 1 }} />

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
  logo: { height: 300, width: '100%' },
  card: { padding: 16, borderRadius: 8 },
  animationContainer: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingAnimation: {
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 32,
    height: 156,
    width: '100%',
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
