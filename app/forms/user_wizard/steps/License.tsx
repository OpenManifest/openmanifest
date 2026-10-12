import * as React from 'react';

import LicenseCardSelect from 'app/components/input/card_select/LicenseCardSelect';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { FederationEssentialsFragment, LicenseEssentialsFragment } from 'app/api/operations';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FieldError } from 'app/ui';

const federation = yup.object() as yup.SchemaOf<FederationEssentialsFragment>;
const license = yup.object() as yup.SchemaOf<LicenseEssentialsFragment>;

export const validation = yup.object({
  license: license.nullable().default(null),
});

type StepFields = {
  [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K];
};

export function useStep(): WizardFormStep<StepFields> {
  const { membership } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        federation: membership?.license?.federation,
        license: membership?.license,
      },
      validation,
    }),
    [membership?.license]
  );
}

function LicenseStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control } = useFormContext<StepFields & { federation?: FederationEssentialsFragment }>();

  const { federation } = useWatch({ control });

  return (
    <Step {...props} title={t('forms.user_wizard.license')}>
      <Fields>
        {federation?.id && (
          <Controller
            {...{ control }}
            name="license"
            render={({ field: { value, onChange: onSelect }, fieldState }) => (
              <>
                <LicenseCardSelect {...{ value, onSelect }} federationId={Number(federation?.id)} />
                <FieldError>{fieldState.error?.message || ''}</FieldError>
              </>
            )}
          />
        )}
      </Fields>
    </Step>
  );
}
export default LicenseStep;
