import * as React from 'react';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import CardSelect from 'app/components/input/card_select/CardSelect';
import { Controller, useFormContext } from 'react-hook-form';
import * as yup from 'yup';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import { useTranslation } from 'react-i18next';
import useTerms from 'app/i18n/useTerms';
import { isRig } from '../rig';

export const validation = yup.object({
  hasRig: yup.boolean().default(false),
});

type StepFields = {
  [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K];
};

export function useStep(): WizardFormStep<StepFields> {
  const { membership } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        hasRig: !!membership?.user?.equipment?.some(isRig),
      },
      validation,
    }),
    [membership?.user?.equipment]
  );
}

function AskForRigStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const { control } = useFormContext<StepFields>();
  return (
    <Step
      {...props}
      title={t('forms.user_wizard.gotAEquipment', { equipment: term('equipment').toLowerCase() })}
    >
      <Fields>
        <Controller
          {...{ control }}
          name="hasRig"
          render={({ field: { onChange, value } }) => (
            <CardSelect
              items={[
                {
                  value: true,
                  label: t('forms.user_wizard.iHaveMyOwnEquipment', {
                    equipment: term('equipment').toLowerCase(),
                  }),
                },
                {
                  value: false,
                  label: t('forms.user_wizard.iDontHaveMyOwnEquipment', {
                    equipment: term('equipment').toLowerCase(),
                  }),
                },
              ]}
              renderItemLabel={({ label }) => label}
              onChangeSelected={(options) => onChange(options?.[0].value)}
              isSelected={({ value: selected }) => value === selected}
              selected={[
                value === false
                  ? {
                      value: false,
                      label: t('forms.user_wizard.iDontHaveMyOwnEquipment', {
                        equipment: term('equipment').toLowerCase(),
                      }),
                    }
                  : {
                      value: true,
                      label: t('forms.user_wizard.iHaveMyOwnEquipment', {
                        equipment: term('equipment').toLowerCase(),
                      }),
                    },
              ]}
            />
          )}
        />
      </Fields>
    </Step>
  );
}

export default AskForRigStep;
