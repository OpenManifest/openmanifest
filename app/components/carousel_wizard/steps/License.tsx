import * as React from 'react';
import { HelperText } from 'react-native-paper';
import LicenseCardSelect from 'app/components/input/card_select/LicenseCardSelect';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { FederationEssentialsFragment, LicenseEssentialsFragment } from 'app/api/operations';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';

const federation = yup.object() as yup.SchemaOf<FederationEssentialsFragment>;
const license = yup.object() as yup.SchemaOf<LicenseEssentialsFragment>;

export const validation = yup.object({
  license: license.nullable().default(null)
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(): WizardFormStep<StepFields> {
  const { dropzoneUser } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        federation: dropzoneUser?.license?.federation,
        license: dropzoneUser?.license
      },
      validation
    }),
    [dropzoneUser?.license]
  );
}

function LicenseStep(props: IWizardStepProps) {
  const { control } = useFormContext<StepFields & { federation?: FederationEssentialsFragment }>();

  const { federation } = useWatch({ control });

  return (
    <Step {...props} title="License">
      <Fields>
        {federation?.id && (
          <Controller
            {...{ control }}
            name="license"
            render={({ field: { value, onChange: onSelect }, fieldState }) => (
              <>
                <LicenseCardSelect {...{ value, onSelect }} federationId={Number(federation?.id)} />
                <HelperText type={fieldState.error ? 'error' : 'info'}>{fieldState.error?.message || ''}</HelperText>
              </>
            )}
          />
        )}
      </Fields>
    </Step>
  );
}
export default LicenseStep;
