import * as React from 'react';
import TextInput from 'app/components/input/text/TextField';
import { HelperText } from 'react-native-paper';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { Step, IWizardStepProps, Fields } from 'app/components/navigation_wizard/Step';
import PasswordComplexityIndicator from 'app/components/input/PasswordComplexityIndicator';
import checkPasswordComplexity from 'app/utils/checkPasswordComplexity';

function PasswordStep(props: IWizardStepProps) {
  const { fields } = useAppSelector((state) => state.screens.signup);
  const dispatch = useAppDispatch();
  return (
    <Step {...props} title="Password">
      <Fields>
        <TextInput
          mode="flat"
          label="Password"
          error={fields.password.error}
          textContentType="password"
          secureTextEntry
          passwordRules="required: upper; required: lower; required: digit; minlength: 8;"
          value={fields.password.value}
          onChange={(newValue) => dispatch(actions.screens.signup.setField(['password', newValue]))}
          style={{ width: '100%', backgroundColor: 'transparent', fontSize: 32, height: 70 }}
        />
        <PasswordComplexityIndicator strength={checkPasswordComplexity(fields.password.value)} />
        <HelperText type="error">{fields.password.error}</HelperText>
      </Fields>
    </Step>
  );
}

export default PasswordStep;
