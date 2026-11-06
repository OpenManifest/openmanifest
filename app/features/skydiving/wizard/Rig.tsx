import * as React from 'react';
import { Stack } from 'app/ui';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import Select from 'app/components/input/select/Select';
import { Controller, useFormContext } from 'react-hook-form';
import { FormTextField } from 'app/components/input/text/TextField';

import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import useTerms from 'app/i18n/useTerms';
import i18n from 'app/i18n';
import { isRig } from '../rig';

export const validation = yup.object({
  rigId: yup.string().nullable().default(null),
  make: yup
    .string()
    .required(() => i18n.t('forms.user_wizard.pleaseSelectAManufacturer'))
    .default('Icon'),
  model: yup.string().required(() => i18n.t('forms.user_wizard.pleaseEnterTheModelOfYour')),
  serial: yup.string().required(() => i18n.t('forms.user_wizard.serialNumberMakesItFasterTo')),
});

type StepFields = {
  [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K];
};

export function useStep(): WizardFormStep<StepFields> {
  const { membership } = useUserProfileContext();
  const rig = membership?.user?.equipment?.find(isRig);

  return useMemo(
    () => ({
      defaultValues: {
        make: rig?.make || '',
        model: rig?.model || '',
        serial: rig?.serial || '',
        rigId: rig?.id || null,
      },
      validation,
    }),
    [rig]
  );
}

function RigWizardScreen(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const term = useTerms();
  const { control } = useFormContext<StepFields>();
  const [isOtherMake, setIsOtherMake] = React.useState(false);

  return (
    <Step
      {...props}
      title={t('forms.user_wizard.yourEquipment', { equipment: term('equipment').toLowerCase() })}
    >
      <Fields>
        <Controller
          {...{ control }}
          name="make"
          render={({ field: { value, onChange }, fieldState }) => (
            <>
              <Select<string>
                label={t('forms.user_wizard.manufacturer')}
                onChange={(value) => {
                  setIsOtherMake(value === 'other');
                  onChange(value);
                }}
                {...{ value }}
                options={[
                  'Icon',
                  'Javelin',
                  'Mirage',
                  'Vector / UPT',
                  'PA (Talon)',
                  'Infinity',
                  'Parachutes de France',
                  'Parachute Systems',
                  'Racer',
                ]
                  .map((label) => ({ label, value: label }))
                  .concat([{ label: t('forms.user_wizard.other'), value: 'other' }])}
              />
            </>
          )}
        />

        {!isOtherMake ? null : (
          <Stack gap="sm">
            <FormTextField
              {...{ control }}
              name="make"
              label={t('forms.user_wizard.otherManufacturer')}
            />
          </Stack>
        )}

        <Stack gap="sm">
          <FormTextField {...{ control }} name="model" label={t('forms.fields.model')} />
        </Stack>
        <Stack gap="sm">
          <FormTextField
            {...{ control }}
            name="serial"
            label={t('forms.user_wizard.serialNumber')}
          />
        </Stack>
      </Fields>
    </Step>
  );
}

export default RigWizardScreen;
