import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { Control, useFormContext } from 'react-hook-form';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';

export const validation = yup.object({
  nickname: yup.string().nullable().default(null)
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(): WizardFormStep<StepFields> {
  const { dropzoneUser } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        nickname: dropzoneUser?.user?.nickname
      },
      validation
    }),
    [dropzoneUser?.user?.nickname]
  );
}
export interface INicknameStepProps extends IWizardStepProps {
  control: Control<StepFields>;
}

function NicknameStep(props: IWizardStepProps) {
  const { control } = useFormContext<StepFields>();
  return (
    <Step {...props} title="Nickname">
      <Fields>
        <FormTextField
          {...{ control }}
          name="nickname"
          mode="flat"
          label="Nickname"
          style={{ backgroundColor: 'transparent', fontSize: 32, height: 70 }}
        />
      </Fields>
    </Step>
  );
}
export default NicknameStep;
