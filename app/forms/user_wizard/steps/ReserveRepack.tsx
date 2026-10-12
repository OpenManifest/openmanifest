import * as React from 'react';
import { Card, Subheader } from 'app/ui';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { DatePickerField } from 'app/components/input/date_picker';
import { useFormContext } from 'react-hook-form';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import i18n from 'app/i18n';

export const validation = yup.object({
  repackExpiresAt: yup
    .number()
    .required(() => i18n.t('forms.user_wizard.pleaseEnterTheDateOfYour'))
    .transform((value) => {
      return value ? Number(value) : undefined;
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
        repackExpiresAt: membership?.user?.rigs?.[0]?.repackExpiresAt || undefined,
      },
      validation,
    }),
    [membership?.user?.rigs]
  );
}

function ReserveRepackStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control } = useFormContext<StepFields>();

  return (
    <Step {...props} title={t('forms.user_wizard.nextReserveRepack')}>
      <Fields>
        <Card>
          <Subheader>{t('forms.user_wizard.dueDate')}</Subheader>
          <DatePickerField
            {...{ control }}
            name="repackExpiresAt"
            label={t('forms.user_wizard.reserveRepackDueDate')}
          />
        </Card>
      </Fields>
    </Step>
  );
}

export default ReserveRepackStep;
