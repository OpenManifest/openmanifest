import * as React from 'react';
import { FormTextField } from 'app/components/input/text/TextField';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { Control, useFormContext } from 'react-hook-form';
import { useUserProfileContext } from 'app/api/crud';
import { useOperatorContext } from 'app/providers/operator/context';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { limitsModule } from 'app/utils/limits';
import i18n from 'app/i18n';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** A date as `YYYY-MM-DD` that exists, or nothing */
export function isIsoDate(value?: string | null) {
  if (!value || !ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export const validation = yup.object({
  dateOfBirth: yup
    .string()
    .nullable()
    .default(null)
    .test(
      'date-of-birth',
      () => i18n.t('forms.user_wizard.dateOfBirthMustBeADate'),
      (value) => !value || (isIsoDate(value) && new Date(value) < new Date())
    ),
});

type StepFields = {
  [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K];
};

/** Tickets and activities can have an age limit; then a member needs a date of birth (the `limits` module's `age`) */
export function useDateOfBirthStepRequired(): boolean {
  const {
    operator: { operator },
  } = useOperatorContext();
  return !!limitsModule(operator?.modules as Record<string, unknown> | undefined)?.age;
}

export function useStep(): WizardFormStep<StepFields> {
  const { membership } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        dateOfBirth: membership?.user?.dateOfBirth ?? null,
      },
      validation,
    }),
    [membership?.user?.dateOfBirth]
  );
}

export interface IDateOfBirthStepProps extends IWizardStepProps {
  control: Control<StepFields>;
}

function DateOfBirthStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control } = useFormContext<StepFields>();
  return (
    <Step {...props} title={t('forms.user_wizard.dateOfBirth')}>
      <Fields>
        <FormTextField
          {...{ control }}
          name="dateOfBirth"
          label={t('forms.user_wizard.dateOfBirthLabel')}
          helperText={t('forms.user_wizard.dateOfBirthHelper')}
        />
      </Fields>
    </Step>
  );
}
export default DateOfBirthStep;
