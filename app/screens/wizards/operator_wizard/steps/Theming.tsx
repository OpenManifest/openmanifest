import * as React from 'react';
import { useController } from 'react-hook-form';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { PhonePreview, WebPreview } from 'app/components/theme_preview';
import ColorPicker from 'app/components/input/colorpicker';
import { DEFAULT_BRAND, useTheme } from 'app/ui';
import { useOperatorWizardFields } from '../useOperatorWizardForm';

function ThemingStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const { control, setField } = useOperatorWizardFields();
  const { field, fieldState } = useController({ name: 'primaryColor', control });
  const colour = field.value || DEFAULT_BRAND;

  return (
    <Step {...props} title={t('operatorWizard.brandingTitle')}>
      <Fields>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-evenly',
            marginBottom: theme.space.lg,
          }}
          aria-hidden
          importantForAccessibility="no-hide-descendants"
        >
          <PhonePreview primaryColor={colour} />
          <WebPreview primaryColor={colour} />
        </View>

        <ColorPicker
          title={t('operatorWizard.brandColour')}
          helperText={t('operatorWizard.brandColourHelp')}
          error={fieldState.error?.message}
          onChange={(value) => setField('primaryColor', value)}
          value={field.value}
        />
      </Fields>
    </Step>
  );
}

export default ThemingStep;
