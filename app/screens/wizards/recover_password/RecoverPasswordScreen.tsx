import * as React from 'react';
import { Wizard } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { useRecoverPasswordMutation } from 'app/api/reflection';
import EmailStep from './steps/Email';
import DoneStep from './steps/Done';

export default function SignupWizard() {
  const state = useAppSelector((root) => root.screens.signup);
  const dispatch = useAppDispatch();

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
      name="RecoverPasswordWizard"
      steps={[{ onNext: onClickRecover, component: EmailStep }, { component: DoneStep }]}
    />
  );
}
