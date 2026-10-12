import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { Control, useFormContext } from 'react-hook-form';

import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import i18n from 'app/i18n';

export const validation = yup.object({
  name: yup
    .string()
    .required(() => i18n.t('forms.user_wizard.pleaseEnterYourFullNameIncluding'))
    .test({
      name: 'fullName',
      test: (value) => {
        return /\w+\s\w+/.test(value || '');
      },
      message: i18n.t('forms.user_wizard.pleaseEnterYourFullNameIncluding'),
    }),
});

type StepFields = {
  [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K];
};

export function useStep(): WizardFormStep<StepFields> {
  const { membership } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        name: membership?.user?.name || '',
      },
      validation,
    }),
    [membership?.user?.name]
  );
}
export interface IRealNameStepProps extends IWizardStepProps {
  control: Control<StepFields>;
}

function RealName(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control } = useFormContext<StepFields>();

  return (
    <Step {...props} title={t('forms.user_wizard.realName')}>
      <Fields>
        <FormTextField
          {...{ control }}
          defaultValue=""
          name="name"
          label={t('forms.fields.name')}
        />
      </Fields>
    </Step>
  );
}

export default RealName;
