import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { useFormContext } from 'react-hook-form';

import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';

export const validation = yup.object({
  name: yup
    .string()
    .required('Please enter your full name, including surname')
    .test({
      name: 'fullName',
      test: (value) => {
        console.debug('VALIDATING NAME', value);
        return /\w+\s\w+/.test(value || '');
      },
      message: 'Please enter your full name, including surname'
    })
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(): WizardFormStep<StepFields> {
  const { dropzoneUser } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        name: dropzoneUser?.user?.name || ''
      },
      validation
    }),
    [dropzoneUser?.user?.name]
  );
}

function RealName(props: IWizardStepProps) {
  const { control } = useFormContext<StepFields>();

  return (
    <Step {...props} title="Real name">
      <Fields>
        <FormTextField
          {...{ control }}
          defaultValue=""
          name="name"
          mode="flat"
          label="Name"
          style={{ backgroundColor: 'transparent', fontSize: 32, height: 70 }}
        />
      </Fields>
    </Step>
  );
}

export default RealName;
