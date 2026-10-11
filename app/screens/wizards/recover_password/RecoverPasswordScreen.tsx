import * as React from 'react';
import { Wizard } from 'app/components/carousel_wizard';
import { useRecoverPasswordMutation } from 'app/api/reflection';
import { WizardRef } from 'app/components/carousel_wizard/Wizard';
import EmailStep from './steps/Email';
import DoneStep from './steps/Done';
import { RecoverPasswordFieldsProvider } from './fields';
import { useFieldState } from '../fields';

export default function SignupWizard() {
  const fields = useFieldState({ email: '' });
  const { values, setError } = fields;
  const wizard = React.useRef<WizardRef>(null);
  const [onRecover] = useRecoverPasswordMutation();

  const onClickRecover = React.useCallback(async () => {
    try {
      await onRecover({
        variables: {
          email: values.email,
          redirectUrl: '',
        },
      });
    } catch (e) {
      if (e instanceof Error) {
        setError('email', e.message);
      }
      throw e;
    }
  }, [onRecover, setError, values.email]);

  return (
    <RecoverPasswordFieldsProvider value={fields}>
      <Wizard
        dots
        ref={wizard}
        steps={[{ onNext: onClickRecover, component: EmailStep }, { component: DoneStep }]}
      />
    </RecoverPasswordFieldsProvider>
  );
}
