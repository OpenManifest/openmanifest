import * as React from 'react';
import { Card, Row, Stack, Text, useTheme } from 'app/ui';
import { View } from 'react-native';
import { ceil } from 'lodash';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { NumberFieldType } from 'app/components/input/number_input/NumberField';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormNumberField } from 'app/components/input/number_input';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import i18n from 'app/i18n';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import { UNIT_SYMBOLS, convert, unitOf } from 'app/i18n/units';
import { canopySize, isRig } from '../rig';

export const validation = yup.object({
  canopySize: yup.number().required(() => i18n.t('forms.user_wizard.pleaseEnterYourCanopySizeIn')),
  bodyMassKg: yup
    .number()
    .required(() => i18n.t('forms.user_wizard.enterYourExitWeight'))
    .default(70),
});

type StepFields = {
  [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K];
};

export function useStep(): WizardFormStep<StepFields> {
  const { membership } = useUserProfileContext();
  const units = useOperatorFormat((state) => state.units);

  return useMemo(
    () => ({
      defaultValues: {
        // In the operator's area unit (square feet), as the jumper knows it
        canopySize: canopySize(membership?.user?.equipment?.find(isRig), units) ?? 150,
        bodyMassKg: membership?.user?.bodyMassKg ? parseFloat(membership?.user?.bodyMassKg) : 70,
      },
      validation,
    }),
    [membership?.user?.bodyMassKg, membership?.user?.equipment, units]
  );
}

function WingloadingWizardScreen(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control } = useFormContext<StepFields>();

  const { canopySize, bodyMassKg } = useWatch({ control });
  const theme = useTheme();
  const units = useOperatorFormat((state) => state.units);
  const areaUnit = unitOf('area', units);
  // Pounds per square foot: the canopy is typed in the operator's unit
  const squareFeet = convert('area', Number(canopySize || 150), areaUnit, 'ft2');
  const wingLoading = ceil((2.205 * Number(bodyMassKg || 50)) / squareFeet, 2);

  return (
    <Step {...props} title={t('forms.user_wizard.wingLoading')}>
      <Fields>
        <Row gap="lg" align="center">
          <View
            style={{
              width: theme.density.touchTarget * 2,
              height: theme.density.touchTarget * 2,
              borderRadius: theme.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colour.brandSoft,
            }}
          >
            <Text variant="title" tone="onBrandSoft" testID="wing-loading">
              {wingLoading.toString()}
            </Text>
          </View>
          <Stack gap="xs" flex>
            <Text variant="title" role="heading" aria-level={2}>
              {t('forms.user_wizard.yourWingloading')}
            </Text>
            <Text tone="muted">{t('forms.user_wizard.wingLoadingIs')}</Text>
          </Stack>
        </Row>

        <Card variant="raised">
          <Stack gap="md">
            <FormNumberField
              {...{ control }}
              name="bodyMassKg"
              label={t('forms.user_wizard.yourExitWeight')}
              variant={NumberFieldType.Weight}
              helperText={t('forms.user_wizard.yourWeightInKgS')}
            />
            <FormNumberField
              {...{ control }}
              name="canopySize"
              label={t('forms.user_wizard.canopySize')}
              unit={UNIT_SYMBOLS[areaUnit]}
              helperText={t('forms.user_wizard.sizeOfYourMainCanopy')}
            />
          </Stack>
        </Card>
      </Fields>
    </Step>
  );
}

export default WingloadingWizardScreen;
