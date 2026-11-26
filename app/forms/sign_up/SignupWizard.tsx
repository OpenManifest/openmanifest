import * as React from 'react';
import { Wizard } from 'app/components/carousel_wizard';
import { FormProvider } from 'react-hook-form';
import { useNotifications } from 'app/providers/notifications';
import { useNavigation } from '@react-navigation/native';
import PasswordStep from './steps/Password';
import EmailStep from './steps/Email';
import PasswordConfirmationStep from './steps/PasswordConfirmation';
import DoneStep from './steps/Done';
import useSignupForm from './useForm';
import i18n from 'app/i18n';

export default function SignupWizard() {
  const notify = useNotifications();
  const navigation = useNavigation();
  const { onNext, ...methods } = useSignupForm({
    onSuccess: () => {
      notify.success(i18n.t('forms.sign_up.aConfirmationLinkHasBeenSent'));
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
