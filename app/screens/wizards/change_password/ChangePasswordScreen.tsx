import * as React from 'react';
import { Wizard } from 'app/components/carousel_wizard';
import { useUpdateLostPasswordMutation } from 'app/api/reflection';
import checkPasswordComplexity, { PasswordStrength } from 'app/utils/checkPasswordComplexity';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WizardRef } from 'app/components/carousel_wizard/Wizard';
import DoneStep from './steps/Done';
import PasswordStep from './steps/Password';
import PasswordConfirmationStep from './steps/PasswordConfirmation';
import { ChangePasswordFieldsProvider } from './fields';
import { useFieldState } from '../fields';

export default function SignupWizard() {
  const fields = useFieldState({ password: '', passwordConfirmation: '' });
  const { values, setError } = fields;
  const route = useRoute<{
    key: string;
    name: string;

    params?: { token?: string };
  }>();

  const [updatePassword] = useUpdateLostPasswordMutation();
  const wizard = React.useRef<WizardRef>(null);

  const onChangePassword = React.useCallback(async () => {
    try {
      if (values.password !== values.passwordConfirmation) {
        throw new Error('Password mismatch. Did you type exactly the same password?');
      }
      if (!route.params?.token) {
        throw new Error('Security token missing - try clicking the link in the email again');
      }
      const result = await updatePassword({
        variables: {
          password: values.password,
          passwordConfirmation: values.passwordConfirmation,
          token: route.params.token,
        },
      });

      if (result?.data?.userUpdatePasswordWithToken?.authenticatable) {
        return;
      }
      if (result.errors?.length) {
        throw new Error(result.errors[0].message);
      }
      throw new Error('Password change failed');
    } catch (e) {
      if (e instanceof Error) {
        setError('passwordConfirmation', e.message);
      }
      throw e;
    }
  }, [route.params?.token, setError, values.password, values.passwordConfirmation, updatePassword]);

  const navigation = useNavigation();

  const validatePassword = React.useCallback(async () => {
    if (checkPasswordComplexity(values.password) < PasswordStrength.Acceptable) {
      setError('password', 'Password too weak');
      throw new Error('Password too weak');
    }
  }, [setError, values.password]);

  const onFinished = React.useCallback(async () => {
    // @ts-ignore
    navigation.replace('Unauthenticated', { screen: 'LoginScreen' });
    throw new Error('Error thrown to prevent navigation.goBack');
  }, [navigation]);

  return (
    <ChangePasswordFieldsProvider value={fields}>
      <Wizard
        dots
        ref={wizard}
        steps={[
          { onBack: navigation.goBack, onNext: validatePassword, component: PasswordStep },
          { onNext: onChangePassword, component: PasswordConfirmationStep },
          { component: DoneStep, onNext: onFinished },
        ]}
      />
    </ChangePasswordFieldsProvider>
  );
}
