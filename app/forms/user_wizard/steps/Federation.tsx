import * as React from 'react';

import FederationCardSelect from 'app/components/input/card_select/FederationCardSelect';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { FederationEssentialsFragment } from 'app/api/operations';
import { Control, Controller, useFormContext } from 'react-hook-form';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { useOperatorContext } from 'app/providers/operator/context';
import { useTranslation } from 'react-i18next';
import { FieldError } from 'app/ui';

const federation = yup.object() as yup.SchemaOf<FederationEssentialsFragment>;

export const validation = yup.object({
  federation: federation.nullable().default(null),
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
        federation: membership?.license?.federation || operator?.federation,
      },
      validation,
    }),
    [operator?.federation, membership?.license?.federation]
  );
}

export interface IFederationStepProps extends IWizardStepProps {
  control: Control<StepFields>;
}

function FederationWizardSceen(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control } = useFormContext<StepFields>();

  return (
    <Step {...props} title={t('forms.user_wizard.affiliation')}>
      <Fields>
        <Controller
          {...{ control }}
          name="federation"
          render={({ field: { value, onChange: onSelect }, fieldState }) => (
            <>
              <FederationCardSelect {...{ value, onSelect }} />
              <FieldError>{fieldState?.error?.message || ''}</FieldError>
            </>
          )}
        />
      </Fields>
    </Step>
  );
}

export default FederationWizardSceen;
