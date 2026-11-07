import * as React from 'react';
import { Card, Stack, Subheader } from 'app/ui';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { DatePickerField } from 'app/components/input/date_picker';
import { FormTextField } from 'app/components/input/text/TextField';
import { useFormContext, useWatch } from 'react-hook-form';
import { useUserProfileContext } from 'app/api/crud';
import { useOperatorContext } from 'app/providers/operator/context';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

/** What the person enters for one qualification the operator asks for */
export type QualificationEntry = {
  qualificationId: string;
  name: string;
  number: string;
  /** Seconds since the epoch, like the other dates of the wizard; empty for a qualification that does not expire */
  expiresAt: number | null;
};

export const validation = yup.object({
  qualifications: yup
    .array()
    .of(
      yup.object({
        qualificationId: yup.string().required(),
        name: yup.string().default(''),
        number: yup.string().default(''),
        expiresAt: yup.number().nullable().default(null),
      })
    )
    .default([]),
});

type StepFields = {
  [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K];
};

/** The step is only part of the wizard when the operator's tickets or extras ask for qualifications */
export function useQualificationStepRequired(): boolean {
  const {
    operator: { operator },
  } = useOperatorContext();
  return !!operator?.requiredQualifications?.length;
}

export function useStep(): WizardFormStep<StepFields> {
  const { membership } = useUserProfileContext();
  const {
    operator: { operator },
  } = useOperatorContext();

  return useMemo(() => {
    const held = (membership?.user?.userCertifications ?? []).flatMap(
      (certification) => certification.qualifications ?? []
    );
    return {
      defaultValues: {
        qualifications: (operator?.requiredQualifications ?? []).map((qualification) => {
          const current = held.find((item) => item.qualification?.id === qualification.id);
          return {
            qualificationId: qualification.id,
            name: qualification.name ?? '',
            number: current?.number ?? '',
            expiresAt: current?.expiresAt
              ? Math.floor(new Date(current.expiresAt).getTime() / 1000)
              : null,
          };
        }),
      },
      validation,
    };
  }, [membership?.user?.userCertifications, operator?.requiredQualifications]);
}

function QualificationsStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control } = useFormContext<StepFields>();
  const qualifications = useWatch({ control, name: 'qualifications' }) ?? [];

  return (
    <Step {...props} title={t('forms.user_wizard.qualifications')}>
      <Fields>
        <Stack gap="md">
          {qualifications.map((qualification, index) => (
            <Card key={qualification?.qualificationId}>
              <Stack gap="md">
                <Subheader>{qualification?.name}</Subheader>
                <FormTextField
                  {...{ control }}
                  name={`qualifications.${index}.number` as const}
                  label={t('forms.user_wizard.qualificationNumber')}
                />
                <DatePickerField
                  {...{ control }}
                  name={`qualifications.${index}.expiresAt` as const}
                  label={t('forms.user_wizard.qualificationExpires')}
                />
              </Stack>
            </Card>
          ))}
        </Stack>
      </Fields>
    </Step>
  );
}

export default QualificationsStep;
