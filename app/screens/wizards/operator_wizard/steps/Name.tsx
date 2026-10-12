import * as React from 'react';
import { useController } from 'react-hook-form';
import TextInput from 'app/components/input/text/TextField';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { useOperatorWizardFields } from '../useOperatorWizardForm';

function Name(props: IWizardStepProps) {
  const { control, setField } = useOperatorWizardFields();
  const { field, fieldState } = useController({ name: 'name', control });

  return (
    <Step {...props} title="Name">
      <Fields>
        <TextInput
          mode="flat"
          label="Name"
          error={fieldState.error?.message}
          value={field.value}
          onChange={(newValue) => setField('name', newValue)}
        />
      </Fields>
    </Step>
  );
}
export default Name;
