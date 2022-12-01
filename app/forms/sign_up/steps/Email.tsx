import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard/Step';
import { useFormContext } from 'react-hook-form';

function EmailStep(props: IWizardStepProps) {
  const { control } = useFormContext();
  return (
    <Step {...props} title="Email">
      <Fields>
        <FormTextField
          {...{ control }}
          name="email"
          mode="flat"
          label="Email"
          style={{ width: '100%', backgroundColor: 'transparent', fontSize: 32, height: 70 }}
        />
      </Fields>
    </Step>
  );
}

export default EmailStep;
