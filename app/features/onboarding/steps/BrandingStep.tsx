import * as React from 'react';
import { useTranslation } from 'react-i18next';
import ColorPicker from 'app/components/input/colorpicker';
import useImagePicker from 'app/hooks/useImagePicker';
import { useThemeOverrides } from 'app/theme';
import { Avatar, Button, Row, Stack, Text } from 'app/ui';
import type { StepProps } from './types';

/** How the operator looks: its brand colour (previewed in the app as it is picked) and its logo */
export default function BrandingStep({ values, set, errors }: StepProps) {
  const { t } = useTranslation(['common', 'terms']);
  const pickImage = useImagePicker();

  const onPickLogo = React.useCallback(async () => {
    const base64 = await pickImage().catch(() => undefined);
    if (base64) set({ banner: `data:image/jpeg;base64,${base64}` });
  }, [pickImage, set]);

  return (
    <Stack gap="lg">
      <ColorPicker
        title={t('operatorWizard.brandColour')}
        helperText={t('operatorWizard.brandColourHelp')}
        error={errors.primaryColor}
        value={values.primaryColor}
        onChange={(primaryColor) => {
          useThemeOverrides.getState().setPrimary(primaryColor);
          set({ primaryColor });
        }}
      />
      <Stack gap="sm">
        <Text variant="label">{t('operatorWizard.logo')}</Text>
        <Row gap="md" align="center">
          <Avatar name={values.name} imageUri={values.banner || undefined} size="lg" />
          <Button
            testID="wizard-pick-logo"
            label={t('operatorWizard.pickLogo')}
            icon="image"
            variant="secondary"
            onPress={onPickLogo}
          />
        </Row>
        <Text tone="muted">
          {t('operatorWizard.logoHelp', { operator: t('terms:operator').toLowerCase() })}
        </Text>
      </Stack>
    </Stack>
  );
}
