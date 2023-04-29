import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import * as yup from 'yup';
import { useDropzoneContext } from 'app/providers';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import { Control, useFormContext } from 'react-hook-form';

export const validation = yup.object({
  name: yup
    .string()
    .required('Dropzone name is required')
    .test({
      name: 'name',
      test: (value) => {
        return /\w+/.test(value || '');
      },
      message: 'Dropzone name is required'
    })
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(): WizardFormStep<StepFields> {
  const {
    dropzone: { dropzone }
  } = useDropzoneContext();

  return useMemo(
    () => ({
      defaultValues: {
        name: dropzone?.name || ''
      },
      validation
    }),
    [dropzone?.name]
  );
}

function Name(props: IWizardStepProps) {
  const { control } = useFormContext<StepFields>();

  return (
    <Step {...props} title="Dropzone">
      <Fields>
        <FormTextField mode="flat" label="Name" {...{ control }} name="name" />
      </Fields>
    </Step>
  );
}
export default Name;
