import * as React from 'react';
import { HelperText } from 'react-native-paper';
import FederationCardSelect from 'app/components/input/card_select/FederationCardSelect';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { FederationEssentialsFragment } from 'app/api/operations';
import { Control, Controller, useFormContext } from 'react-hook-form';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { useDropzoneContext } from 'app/providers/dropzone/context';

const federation = yup.object() as yup.SchemaOf<FederationEssentialsFragment>;

export const validation = yup.object({
  federation: federation.nullable().default(null)
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(): WizardFormStep<StepFields> {
  const { dropzoneUser } = useUserProfileContext();
  const {
    dropzone: { dropzone }
  } = useDropzoneContext();

  return useMemo(
    () => ({
      defaultValues: {
        federation: dropzoneUser?.license?.federation || dropzone?.federation
      },
      validation
    }),
    [dropzone?.federation, dropzoneUser?.license?.federation]
  );
}

export interface IFederationStepProps extends IWizardStepProps {
  control: Control<StepFields>;
}

function FederationWizardSceen(props: IWizardStepProps) {
  const { control } = useFormContext<StepFields>();

  return (
    <Step {...props} title="Affiliation">
      <Fields>
        <Controller
          {...{ control }}
          name="federation"
          render={({ field: { value, onChange: onSelect }, fieldState }) => (
            <>
              <FederationCardSelect {...{ value, onSelect }} />
              <HelperText type={fieldState?.error ? 'error' : 'info'}>{fieldState?.error?.message || ''}</HelperText>
            </>
          )}
        />
      </Fields>
    </Step>
  );
}

export default FederationWizardSceen;
