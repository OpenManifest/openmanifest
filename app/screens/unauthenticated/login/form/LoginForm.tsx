import * as React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { TouchableOpacity } from 'react-native-gesture-handler';

import { primaryColor } from 'app/constants/Colors';
import Divider from 'app/components/Divider';

import LottieView from 'app/components/LottieView';
import { FormTextField } from 'app/components/input/text/TextField';
import FacebookButton from './FacebookButton';
import AppleButton from './AppleButton';
import useLoginForm from './useForm';

export default function LoginForm() {
  const navigation = useNavigation();
  const theme = useTheme();

  const { control, onSubmit, loading, loginWithApple, loginWithFacebook } = useLoginForm();
  return (
    <ScrollView>
      {loading ? (
        <View style={styles.animationContainer}>
          <LottieView
            autoPlay
            loop
            style={styles.loadingAnimation}
            source={require('../../../../../assets/images/loading.json')}
          />
        </View>
      ) : (
        <>
          <FormTextField {...{ control }} name="email" label="Email" mode="outlined" disabled={loading} />

          <FormTextField
            {...{ control }}
            label="Password"
            name="password"
            mode="outlined"
            disabled={loading}
            secureTextEntry
            onSubmitEditing={onSubmit}
          />
        </>
      )}
      {loading ? null : (
        <TouchableOpacity onPress={() => navigation.navigate('Wizards', { screen: 'RecoverPasswordScreen' })}>
          <Text style={theme.dark ? styles.forgotPasswordDark : styles.forgotPassword}>Forgot your password?</Text>
        </TouchableOpacity>
      )}
      <Button
        mode="contained"
        disabled={loading}
        labelStyle={{ color: theme.colors.onSurface }}
        style={[styles.button, { backgroundColor: theme.colors.surface, borderColor: theme.colors.surface }]}
        onPress={onSubmit}
      >
        {loading ? 'Authenticating...' : 'Log in'}
      </Button>

      <Divider>or</Divider>
      <FacebookButton disabled={loading} style={{ marginTop: 8 }} onPress={loginWithFacebook} />

      <AppleButton onPress={loginWithApple} style={{ width: '100%', flex: 1 }} />

      <Button
        labelStyle={styles.textButtonLabel}
        style={styles.textButton}
        onPress={() => navigation.navigate('Unauthenticated', { screen: 'SignUpScreen' })}
      >
        Sign up
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: primaryColor,
    paddingTop: 10
  },
  logo: { height: 300, width: '100%' },
  card: { padding: 16, borderRadius: 8 },
  cardLandscape: { height: '100%', width: '100%', justifyContent: 'center' },

  animationContainer: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingAnimation: {
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 32,
    height: 156,
    width: '100%'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },

  forgotPassword: {
    marginBottom: 16,
    color: 'rgb(50, 50, 50)'
  },
  forgotPasswordDark: {
    marginTop: 8,
    color: 'rgb(180, 180, 180)'
  },

  fields: {
    marginBottom: 10,
    marginTop: -50,
    maxWidth: 400,
    width: '100%',
    paddingHorizontal: 56,
    backgroundColor: 'transparent'
  },
  fieldsLandscape: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    width: 400
  },
  button: {
    marginVertical: 4,
    backgroundColor: 'white',
    borderColor: primaryColor,
    borderWidth: 1,
    width: '100%'
  },
  textButton: {
    marginTop: 10,
    height: 56,
    backgroundColor: 'transparent',
    color: 'white',
    width: '100%'
  },
  textButtonLabel: {
    // color: '#FFFFFF',
  }
});
