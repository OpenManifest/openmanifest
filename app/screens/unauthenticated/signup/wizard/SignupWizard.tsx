import * as React from 'react';
import { Wizard } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { useUserSignUpMutation } from 'app/api/reflection';
import checkPasswordComplexity, { PasswordStrength } from 'app/utils/checkPasswordComplexity';
import PasswordStep from './steps/Password';
import EmailStep from './steps/Email';
import PasswordConfirmationStep from './steps/PasswordConfirmation';
import DoneStep from './steps/Done';

export default function SignupWizard() {
  const state = useAppSelector((root) => root.screens.signup);
  const globalState = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();

  const [onSignUp] = useUserSignUpMutation();

  const validateEmail = React.useCallback(async () => {
    const pattern =
      // eslint-disable-next-line max-len
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const emailRegex = new RegExp(pattern);

    if (!emailRegex.test(state.fields.email.value)) {
      dispatch(actions.screens.signup.setFieldError(['email', 'Please enter a valid email']));
      throw new Error('Invalid email');
    }
  }, [dispatch, state.fields.email.value]);

  const validatePassword = React.useCallback(async () => {
    if (checkPasswordComplexity(state.fields.password.value) < PasswordStrength.Acceptable) {
      dispatch(actions.screens.signup.setFieldError(['password', 'Password too weak']));
      throw new Error('Invalid email');
    }
  }, [dispatch, state.fields.password.value]);

  const onClickSignUp = React.useCallback(async () => {
    if (state.fields.password.value !== state.fields.passwordConfirmation.value) {
      dispatch(
        actions.screens.signup.setFieldError(['passwordConfirmation', 'Password doesnt match'])
      );
      throw new Error('Password mismatch');
    }
    try {
      const result = await onSignUp({
        variables: {
          pushToken: globalState.expoPushToken,
          email: state.fields.email.value,
          name: state.fields.name.value,
          exitWeight: state.fields.exitWeight.value,
          password: state.fields.password.value,
          passwordConfirmation: state.fields.passwordConfirmation.value,
          licenseId: Number(state.fields.license?.value?.id) || null,
          phone: state.fields.phone.value,
        },
      });

      if (result?.data?.userRegister?.fieldErrors?.length) {
        result?.data?.userRegister?.fieldErrors?.forEach(({ field, message }) => {
          switch (field) {
            case 'email':
              dispatch(actions.screens.signup.setFieldError(['email', message]));
              throw new Error('Email error');
            case 'password':
              dispatch(actions.screens.signup.setFieldError(['password', message]));
              throw new Error('Password error');
            case 'passwordConfirmation':
              dispatch(actions.screens.signup.setFieldError(['passwordConfirmation', message]));
              throw new Error('Email error');
            default:
              return undefined;
          }
        });
      }
    } catch (e) {
      if (e instanceof Error) {
        dispatch(actions.screens.signup.setFieldError(['passwordConfirmation', e.message]));
      }
      throw new Error();
    }
  }, [
    dispatch,
    globalState.expoPushToken,
    onSignUp,
    state.fields.email.value,
    state.fields.exitWeight.value,
    state.fields.license?.value?.id,
    state.fields.name.value,
    state.fields.password.value,
    state.fields.passwordConfirmation.value,
    state.fields.phone.value,
  ]);

  return (
    <Wizard
      dots
      name="SignupWizard"
      steps={[
        { onNext: validateEmail, component: EmailStep },
        { onNext: validatePassword, component: PasswordStep },
        { onNext: onClickSignUp, component: PasswordConfirmationStep },
        { component: DoneStep },
      ]}
    />
  );
}
