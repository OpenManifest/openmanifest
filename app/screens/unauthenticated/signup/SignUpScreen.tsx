import * as React from 'react';
import { Image, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { actions, useAppSelector, useAppDispatch } from '../../../state';

import useMutationSignUp from '../../../api/hooks/useMutationSignUp';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';

import { primaryColor } from '../../../constants/Colors';
import logo from '../../../../assets/images/logo.png';

export default function SignupScreen() {
  const state = useAppSelector((root) => root.screens.signup);
  const globalState = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();
  const navigation = useNavigation();

  const { loading, mutate: onSignUp } = useMutationSignUp({
    onSuccess: (payload) => {
      // Reset the form and redirect to login screen with a snackbar
      dispatch(
        actions.notifications.showSnackbar({
          message: 'A confirmation link has been sent to your email',
          variant: 'success',
        })
      );

      navigation.navigate('LoginScreen');
      // Credentials are received on login only now. Return
      return;
      if (payload.credentials) {
        dispatch(actions.global.setCredentials(payload.credentials));
        dispatch(actions.global.setUser(payload.authenticatable!));
      }
    },
    onFieldError: (field, value) =>
      dispatch(actions.screens.signup.setFieldError([field as any, value])),
  });

  return (
    <ScrollableScreen style={styles.container} contentContainerStyle={styles.content}>
      <KeyboardAvoidingView style={styles.fields} behavior="position">
        <Image source={logo} style={{ width: '100%', height: 200 }} resizeMode="contain" />
        <TextInput
          style={styles.field}
          mode="outlined"
          label="Name"
          error={!!state.fields.name.error}
          value={state.fields.name.value}
          onChangeText={(newValue) => dispatch(actions.screens.signup.setField(['name', newValue]))}
        />
        <HelperText type="error">{state.fields.name.error || ''}</HelperText>

        <HelperText type={state.fields.exitWeight.error ? 'error' : 'info'}>
          {state.fields.exitWeight.error || ''}
        </HelperText>

        <TextInput
          style={styles.field}
          mode="outlined"
          label="Email"
          error={!!state.fields.email.error}
          value={state.fields.email.value}
          onChangeText={(newValue) =>
            dispatch(actions.screens.signup.setField(['email', newValue]))
          }
        />

        <HelperText type="error">{state.fields.email.error || ''}</HelperText>

        <TextInput
          style={styles.field}
          mode="outlined"
          label="Phone"
          error={!!state.fields.phone.error}
          value={state.fields.phone.value}
          onChangeText={(newValue) =>
            dispatch(actions.screens.signup.setField(['phone', newValue]))
          }
        />
        <HelperText type="error">{state.fields.phone.error || ''}</HelperText>

        <TextInput
          style={styles.field}
          mode="outlined"
          label="Password"
          error={Boolean(state.fields.password.error || state.fields.passwordConfirmation.error)}
          textContentType="password"
          secureTextEntry
          passwordRules="required: upper; required: lower; required: digit; minlength: 8;"
          value={state.fields.password.value}
          onChangeText={(newValue) =>
            dispatch(actions.screens.signup.setField(['password', newValue]))
          }
        />

        <HelperText type="error">{state.fields.password.error || ''}</HelperText>

        <TextInput
          style={styles.field}
          mode="outlined"
          label="Repeat password"
          error={Boolean(state.fields.password.error || state.fields.passwordConfirmation.error)}
          textContentType="password"
          secureTextEntry
          passwordRules="required: upper; required: lower; required: digit; minlength: 8;"
          value={state.fields.passwordConfirmation.value}
          onChangeText={(newValue) =>
            dispatch(actions.screens.signup.setField(['passwordConfirmation', newValue]))
          }
        />
        <HelperText type="error">{state.fields.passwordConfirmation.error || ''}</HelperText>

        <Button
          mode="contained"
          labelStyle={styles.buttonLabel}
          style={styles.button}
          onPress={() =>
            onSignUp({
              pushToken: globalState.expoPushToken,
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
      </KeyboardAvoidingView>
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
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
    backgroundColor: 'white',
    width: '100%',
  },
  buttonLabel: {
    color: '#FF1414',
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
    width: '100%',
    flexGrow: 1,
    maxWidth: 400,
    backgroundColor: 'transparent',
  },
  field: {
    marginBottom: 8,
    backgroundColor: 'white',
    borderColor: 'white',
    color: 'white',
  },
});
