import * as React from 'react';
import TextInput from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import { useChangePasswordFields } from '../fields';

function PasswordConfirmationStep(props: IWizardStepProps) {
  const { values, errors, setValue } = useChangePasswordFields();
  return (
    <Step {...props} title="Repeat password">
      <Fields>
        <TextInput
          mode="flat"
          label="Password"
          error={errors.passwordConfirmation}
          textContentType="password"
          secureTextEntry
          passwordRules="required: upper; required: lower; required: digit; minlength: 8;"
          value={values.passwordConfirmation}
          onChangeText={(newValue) => setValue('passwordConfirmation', newValue)}
          style={{ width: '100%', backgroundColor: 'transparent', fontSize: 32, height: 70 }}
        />
      </Fields>
    </Step>
  );
}

export default PasswordConfirmationStep;
