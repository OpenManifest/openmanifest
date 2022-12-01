import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import PasswordComplexityIndicator from 'app/components/input/PasswordComplexityIndicator';
import checkPasswordComplexity from 'app/utils/checkPasswordComplexity';
import { useFormContext, useWatch } from 'react-hook-form';

function PasswordStep(props: IWizardStepProps) {
  const { control } = useFormContext();
  const { password } = useWatch({ control });
  return (
    <Step {...props} title="Password">
      <Fields>
        <FormTextField
          name="password"
          {...{ control }}
          mode="flat"
          label="Password"
          textContentType="password"
          secureTextEntry
          passwordRules="required: upper; required: lower; required: digit; minlength: 8;"
          style={{ width: '100%', backgroundColor: 'transparent', fontSize: 32, height: 70 }}
        />
        <PasswordComplexityIndicator strength={checkPasswordComplexity(password)} />
      </Fields>
    </Step>
  );
}

export default PasswordStep;
