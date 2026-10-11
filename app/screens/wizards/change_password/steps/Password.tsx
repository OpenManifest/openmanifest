import * as React from 'react';
import TextInput from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import { useChangePasswordFields } from '../fields';
import PasswordComplexityIndicator from 'app/components/input/PasswordComplexityIndicator';
import checkPasswordComplexity from 'app/utils/checkPasswordComplexity';

function PasswordStep(props: IWizardStepProps) {
  const { values, errors, setValue } = useChangePasswordFields();
  return (
    <Step {...props} title="Password">
      <Fields>
        <TextInput
          mode="flat"
          label="Password"
          error={errors.password}
          textContentType="password"
          secureTextEntry
          passwordRules="required: upper; required: lower; required: digit; minlength: 8;"
          value={values.password}
          onChangeText={(newValue) => setValue('password', newValue)}
          style={{ width: '100%', backgroundColor: 'transparent', fontSize: 32, minHeight: 70 }}
        />
        <PasswordComplexityIndicator strength={checkPasswordComplexity(values.password)} />
      </Fields>
    </Step>
  );
}

export default PasswordStep;
