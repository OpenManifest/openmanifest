import * as React from 'react';
import { Wizard } from 'app/components/carousel_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { useRecoverPasswordMutation } from 'app/api/reflection';
import { WizardRef } from 'app/components/carousel_wizard/Wizard';
import EmailStep from './steps/Email';
import DoneStep from './steps/Done';

export default function SignupWizard() {
  const state = useAppSelector((root) => root.screens.signup);
  const dispatch = useAppDispatch();
  const wizard = React.useRef<WizardRef>(null);
  const [onRecover] = useRecoverPasswordMutation();

  const onClickRecover = React.useCallback(async () => {
    try {
      await onRecover({
        variables: {
          email: state.fields.email.value,
          redirectUrl: '',
        },
      });
    } catch (e) {
      if (e instanceof Error) {
        dispatch(actions.screens.signup.setFieldError(['email', e.message]));
      }
      throw e;
    }
  }, [dispatch, onRecover, state.fields.email.value]);

  return (
    <Wizard
      dots
      ref={wizard}
      steps={[{ onNext: onClickRecover, component: EmailStep }, { component: DoneStep }]}
    />
  );
}
