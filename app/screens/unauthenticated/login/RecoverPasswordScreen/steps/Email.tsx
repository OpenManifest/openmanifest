import * as React from 'react';
import { HelperText, TextInput } from 'react-native-paper';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { Step, IWizardStepProps, Fields } from 'app/components/navigation_wizard/Step';

function EmailStep(props: IWizardStepProps) {
  const { fields } = useAppSelector((state) => state.screens.signup);
  const dispatch = useAppDispatch();
  return (
    <Step {...props} title="Email">
      <Fields>
        <TextInput
          mode="flat"
          label="Email"
          value={fields.email.value || ''}
          onChangeText={(newText) => {
            dispatch(actions.screens.signup.setField(['email', newText]));
          }}
          style={{ width: '100%', backgroundColor: 'transparent', fontSize: 32, height: 70 }}
        />
        <HelperText type="error">{fields.email.error}</HelperText>
      </Fields>
    </Step>
  );
}

export default EmailStep;
