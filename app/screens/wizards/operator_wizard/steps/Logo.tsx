import * as React from 'react';
import { useController } from 'react-hook-form';
import { Image, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import useImagePicker from 'app/hooks/useImagePicker';
import LottieView from 'app/components/LottieView';
import { Tappable, Text, useTheme } from 'app/ui';
import { useOperatorWizardFields } from '../useOperatorWizardForm';

const LOGO_SIZE = 175;

function Logo(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const { control, setField } = useOperatorWizardFields();
  const { field } = useController({ name: 'banner', control });
  const pickImage = useImagePicker();
  const onPickImage = React.useCallback(async () => {
    try {
      const base64 = await pickImage();
      if (base64) {
        setField('banner', `data:image/jpeg;base64,${base64}`);
      }
    } catch {
      // Picking was cancelled or not allowed: the logo stays as it was
    }
  }, [pickImage, setField]);

  return (
    <Step {...props} title={t('operatorWizard.logoTitle')}>
      <Fields>
        <View style={{ alignItems: 'center', justifyContent: 'center', gap: theme.space.lg }}>
          <Tappable
            role="button"
            aria-label={t('operatorWizard.pickLogo')}
            onPress={onPickImage}
            style={{
              width: LOGO_SIZE,
              height: LOGO_SIZE,
              borderRadius: LOGO_SIZE / 2,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: field.value ? theme.colour.brand : 'transparent',
            }}
          >
            {!field.value ? (
              <LottieView
                style={{ height: LOGO_SIZE, width: LOGO_SIZE }}
                autoPlay
                loop={false}
                source={require('../../../../../assets/images/image-pick.json')}
              />
            ) : (
              <Image
                source={{ uri: field.value }}
                style={{ width: LOGO_SIZE, height: LOGO_SIZE }}
                accessibilityLabel={t('operatorWizard.logo')}
              />
            )}
          </Tappable>
          <Text tone="muted" align="center">
            {t('operatorWizard.logoHelp', { operator: t('terms:operator').toLowerCase() })}
          </Text>
        </View>
      </Fields>
    </Step>
  );
}

export default Logo;
