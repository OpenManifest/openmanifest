import * as React from 'react';

import CertificationLevelCardSelect from 'app/components/input/card_select/CertificationLevelCardSelect';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import {
  CertificationBodyEssentialsFragment,
  CertificationLevelEssentialsFragment,
} from 'app/api/operations';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FieldError } from 'app/ui';

const certificationBody = yup.object() as yup.SchemaOf<CertificationBodyEssentialsFragment>;
const certificationLevel = yup.object() as yup.SchemaOf<CertificationLevelEssentialsFragment>;

export const validation = yup.object({
  certificationLevel: certificationLevel.nullable().default(null),
});

type StepFields = {
  [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K];
};

export function useStep(): WizardFormStep<StepFields> {
  const { membership } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        certificationBody: membership?.certificationLevel?.certificationBody,
        certificationLevel: membership?.certificationLevel,
      },
      validation,
    }),
    [membership?.certificationLevel]
  );
}

function CertificationLevelStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control } = useFormContext<
    StepFields & { certificationBody?: CertificationBodyEssentialsFragment }
  >();

  const { certificationBody } = useWatch({ control });

  return (
    <Step {...props} title={t('forms.user_wizard.certificationLevel')}>
      <Fields>
        {certificationBody?.id && (
          <Controller
            {...{ control }}
            name="certificationLevel"
            render={({ field: { value, onChange: onSelect }, fieldState }) => (
              <>
                <CertificationLevelCardSelect
                  {...{ value, onSelect }}
                  certificationBodyId={Number(certificationBody?.id)}
                />
                <FieldError>{fieldState.error?.message || ''}</FieldError>
              </>
            )}
          />
        )}
      </Fields>
    </Step>
  );
}
export default CertificationLevelStep;
