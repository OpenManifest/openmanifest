import * as React from 'react';

import CertificationBodyCardSelect from 'app/components/input/card_select/CertificationBodyCardSelect';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { CertificationBodyEssentialsFragment } from 'app/api/operations';
import { Control, Controller, useFormContext } from 'react-hook-form';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { useOperatorContext } from 'app/providers/operator/context';
import { useTranslation } from 'react-i18next';
import { FieldError } from 'app/ui';

const certificationBody = yup.object() as yup.SchemaOf<CertificationBodyEssentialsFragment>;

export const validation = yup.object({
  certificationBody: certificationBody.nullable().default(null),
});

type StepFields = {
  [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K];
};

export function useStep(): WizardFormStep<StepFields> {
  const { membership } = useUserProfileContext();
  const {
    operator: { operator },
  } = useOperatorContext();

  return useMemo(
    () => ({
      defaultValues: {
        certificationBody:
          membership?.certificationLevel?.certificationBody || operator?.certificationBodies?.[0],
      },
      validation,
    }),
    [operator?.certificationBodies, membership?.certificationLevel?.certificationBody]
  );
}

export interface ICertificationBodyStepProps extends IWizardStepProps {
  control: Control<StepFields>;
}

function CertificationBodyWizardSceen(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const {
    operator: { operator },
  } = useOperatorContext();
  const { control } = useFormContext<StepFields>();

  return (
    <Step {...props} title={t('forms.user_wizard.affiliation')}>
      <Fields>
        <Controller
          {...{ control }}
          name="certificationBody"
          render={({ field: { value, onChange: onSelect }, fieldState }) => (
            <>
              <CertificationBodyCardSelect
                {...{ value, onSelect }}
                bodies={operator?.certificationBodies}
              />
              <FieldError>{fieldState?.error?.message || ''}</FieldError>
            </>
          )}
        />
      </Fields>
    </Step>
  );
}

export default CertificationBodyWizardSceen;
