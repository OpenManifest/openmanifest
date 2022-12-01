import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import { useFormContext } from 'react-hook-form';

function PasswordConfirmationStep(props: IWizardStepProps) {
  const { control } = useFormContext();
  return (
    <Step {...props} title="Repeat password">
      <Fields>
        <FormTextField
          {...{ control }}
          mode="flat"
          label="Password"
          name="passwordConfirmation"
          textContentType="password"
          secureTextEntry
          passwordRules="required: upper; required: lower; required: digit; minlength: 8;"
          style={{ width: '100%', backgroundColor: 'transparent', fontSize: 32, height: 70 }}
        />
      </Fields>
    </Step>
  );
}

export default PasswordConfirmationStep;
