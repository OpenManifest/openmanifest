import * as React from 'react';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import CardSelect from 'app/components/input/card_select/CardSelect';
import { Controller, useFormContext } from 'react-hook-form';
import * as yup from 'yup';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';

export const validation = yup.object({
  hasRig: yup.boolean().default(false)
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(): WizardFormStep<StepFields> {
  const { dropzoneUser } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        hasRig: !!dropzoneUser?.user?.rigs?.length
      },
      validation
    }),
    [dropzoneUser?.user?.rigs?.length]
  );
}

function AskForRigStep(props: IWizardStepProps) {
  const { control } = useFormContext<StepFields>();
  return (
    <Step {...props} title="Got a rig?">
      <Fields>
        <Controller
          {...{ control }}
          name="hasRig"
          render={({ field: { onChange, value } }) => (
            <CardSelect
              items={[
                { value: true, label: 'I have my own rig' },
                { value: false, label: 'I dont have my own rig' }
              ]}
              renderItemLabel={({ label }) => label}
              onChangeSelected={(options) => onChange(options?.[0].value)}
              isSelected={({ value: selected }) => value === selected}
              selected={[
                value === false
                  ? { value: false, label: 'I dont have my own rig' }
                  : { value: true, label: 'I have my own rig' }
              ]}
            />
          )}
        />
      </Fields>
    </Step>
  );
}

export default AskForRigStep;
