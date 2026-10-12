import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { Control, useFormContext, useWatch } from 'react-hook-form';
import { FederationEssentialsFragment } from 'app/api/operations';

import { useUserProfile } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';

const federation = yup.object() as yup.SchemaOf<FederationEssentialsFragment>;

export const validation = yup.object({
  apfNumber: yup.string().nullable().default(''),
});

type StepFields = {
  [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K];
};

export function useStep(): WizardFormStep<StepFields> {
  const { membership } = useUserProfile();

  return useMemo(
    () => ({
      defaultValues: {
        apfNumber:
          membership?.user?.userFederations?.find(
            (f) => f.federation?.id === membership?.license?.federation?.id
          )?.uid || '',
      },
      validation,
    }),
    [membership?.license?.federation?.id, membership?.user?.userFederations]
  );
}

export interface IFederationNumberStepProps extends IWizardStepProps {
  control: Control<StepFields>;
}
function FederationWizardSceen(props: IWizardStepProps) {
  const { control } = useFormContext<StepFields & { federation: FederationEssentialsFragment }>();
  const { apfNumber, federation } = useWatch({ control });

  return (
    <Step {...props} title={`${federation?.name?.toUpperCase()} Number`}>
      <Fields>
        <FormTextField
          {...{ control }}
          name="apfNumber"
          mode="flat"
          style={{ backgroundColor: 'transparent', fontSize: 32, minHeight: 70 }}
          label={`${federation?.name} ID`}
        />
      </Fields>
    </Step>
  );
}

export default FederationWizardSceen;
