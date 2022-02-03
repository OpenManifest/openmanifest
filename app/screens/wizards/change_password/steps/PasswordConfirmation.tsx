import * as React from 'react';
import { HelperText, TextInput } from 'react-native-paper';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { Step, IWizardStepProps, Fields } from 'app/components/navigation_wizard/Step';

function PasswordConfirmationStep(props: IWizardStepProps) {
  const { fields } = useAppSelector((state) => state.screens.signup);
  const dispatch = useAppDispatch();
  return (
    <Step {...props} title="Repeat password">
      <Fields>
        <TextInput
          mode="flat"
          label="Password"
          error={Boolean(fields.passwordConfirmation.error)}
          textContentType="password"
          secureTextEntry
          passwordRules="required: upper; required: lower; required: digit; minlength: 8;"
          value={fields.passwordConfirmation.value}
          onChangeText={(newValue) =>
            dispatch(actions.screens.signup.setField(['passwordConfirmation', newValue]))
          }
          style={{ width: '100%', backgroundColor: 'transparent', fontSize: 32, height: 70 }}
        />
        <HelperText type="error">{fields.passwordConfirmation.error}</HelperText>
      </Fields>
    </Step>
  );
}

export default PasswordConfirmationStep;
