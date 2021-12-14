import * as React from 'react';
import { Wizard } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { useUpdateLostPasswordMutation } from 'app/api/reflection';
import checkPasswordComplexity from 'app/utils/checkPasswordComplexity';
import { User } from 'app/api/schema.d';
import { useNavigation, useRoute } from '@react-navigation/core';
import DoneStep from './steps/Done';
import PasswordStep from './steps/Password';
import PasswordConfirmationStep from './steps/PasswordConfirmation';

export default function SignupWizard() {
  const state = useAppSelector((root) => root.screens.signup);
  const dispatch = useAppDispatch();
  const route = useRoute<{
    key: string;
    name: string;
    // eslint-disable-next-line camelcase
    params?: { token?: string };
  }>();

  const [updatePassword] = useUpdateLostPasswordMutation();

  const onChangePassword = React.useCallback(async () => {
    try {
      if (state.fields.password.value !== state.fields.passwordConfirmation.value) {
        throw new Error('Password mismatch. Did you type exactly the same password?');
      }
      if (!route.params?.token) {
        throw new Error('Security token missing - try clicking the link in the email again');
      }
      const result = await updatePassword({
        variables: {
          password: state.fields.password.value,
          passwordConfirmation: state.fields.passwordConfirmation.value,
          token: route.params.token,
        },
      });

      if (result?.data?.userUpdatePasswordWithToken?.authenticatable) {
        dispatch(
          actions.global.setUser(result.data.userUpdatePasswordWithToken.authenticatable as User)
        );
        return;
      }
      if (result.errors?.length) {
        throw new Error(result.errors[0].message);
      }
      throw new Error('Password change failed');
    } catch (e) {
      dispatch(actions.screens.signup.setFieldError(['passwordConfirmation', e.message]));
      throw new Error();
    }
  }, [
    dispatch,
    route.params?.token,
    state.fields.password.value,
    state.fields.passwordConfirmation.value,
    updatePassword,
  ]);

  const navigation = useNavigation();

  const validatePassword = React.useCallback(async () => {
    if (!checkPasswordComplexity(state.fields.password.value)) {
      dispatch(actions.screens.signup.setFieldError(['password', 'Password too weak']));
      throw new Error('Password too weak');
    }
  }, [dispatch, state.fields.password.value]);

  const onFinished = React.useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    navigation.replace('Unauthenticated', { screen: 'LoginScreen' });
    throw new Error('Error thrown to prevent navigation.goBack');
  }, [navigation]);

  return (
    <Wizard
      dots
      name="ChangePasswordWizard"
      steps={[
        { onBack: navigation.goBack, onNext: validatePassword, component: PasswordStep },
        { onNext: onChangePassword, component: PasswordConfirmationStep },
        { component: DoneStep, onNext: onFinished },
      ]}
    />
  );
}
