import * as React from 'react';
import { Image, View } from 'react-native';
import { Icon, Stack, Tappable, Text, useTheme } from 'app/ui';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import useImagePicker from 'app/hooks/useImagePicker';
import { Controller, useFormContext } from 'react-hook-form';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

export const validation = yup.object({
  avatar: yup.string().nullable().default(null),
});

type StepFields = {
  [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K];
};

export function useStep(): WizardFormStep<StepFields> {
  const { membership } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        avatar: membership?.user?.image,
      },
      validation,
    }),
    [membership?.user?.image]
  );
}

const PHOTO = 175;

function AvatarStep(props: IWizardStepProps) {
  const { t } = useTranslation('common');
  const { control } = useFormContext<StepFields>();
  const theme = useTheme();
  const pickImage = useImagePicker();

  return (
    <Step {...props} title={t('forms.user_wizard.avatar')}>
      <Fields>
        <Stack align="center" gap="lg" padding="xxl">
          <Controller
            {...{ control }}
            name="avatar"
            render={({ field: { value, onChange } }) => (
              <Tappable
                role="button"
                aria-label={t('forms.user_wizard.uploadPhoto')}
                minTarget={false}
                onPress={async () => {
                  try {
                    const base64 = await pickImage();

                    if (base64) {
                      // Upload image
                      onChange(`data:image/jpeg;base64,${base64}`);
                    }
                  } catch {}
                }}
                style={{
                  width: PHOTO,
                  height: PHOTO,
                  borderRadius: theme.radius.pill,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.colour.brandSoft,
                }}
              >
                {!value ? (
                  <Icon name="camera" size={PHOTO / 2} tone="onBrandSoft" />
                ) : (
                  <Image
                    accessible={false}
                    source={{ uri: value }}
                    style={{ width: PHOTO, height: PHOTO }}
                  />
                )}
              </Tappable>
            )}
          />
          <Text>{t('forms.user_wizard.pressToUpload')}</Text>
        </Stack>
      </Fields>
    </Step>
  );
}

export default AvatarStep;
