import * as React from 'react';
import TextInput from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import { useRecoverPasswordFields } from '../fields';

function EmailStep(props: IWizardStepProps) {
  const { values, errors, setValue } = useRecoverPasswordFields();
  return (
    <Step {...props} title="Email">
      <Fields>
        <TextInput
          mode="flat"
          label="Email"
          value={values.email}
          error={errors.email}
          onChangeText={(newText) => {
            setValue('email', newText);
          }}
          style={{ width: '100%', backgroundColor: 'transparent', fontSize: 32, minHeight: 70 }}
        />
      </Fields>
    </Step>
  );
}

export default EmailStep;
