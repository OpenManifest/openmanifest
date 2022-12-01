import * as React from 'react';
import { Wizard } from 'app/components/carousel_wizard';
import { FormProvider } from 'react-hook-form';
import { useNotifications } from 'app/providers/notifications';
import { useNavigation } from '@react-navigation/core';
import PasswordStep from './steps/Password';
import EmailStep from './steps/Email';
import PasswordConfirmationStep from './steps/PasswordConfirmation';
import DoneStep from './steps/Done';
import useSignupForm from './useForm';

export default function SignupWizard() {
  const notify = useNotifications();
  const navigation = useNavigation();
  const { onNext, ...methods } = useSignupForm({
    onSuccess: () => {
      notify.success('A confirmation link has been sent to your email');
      navigation.navigate('Unauthenticated', { screen: 'LoginScreen' });
    },
  });
  return (
    <FormProvider {...methods}>
      <Wizard
        dots
        steps={[
          { onNext, component: EmailStep },
          { onNext, component: PasswordStep },
          { onNext, component: PasswordConfirmationStep },
          { component: DoneStep },
        ]}
      />
    </FormProvider>
  );
}
