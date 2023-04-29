import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, HelperText, Paragraph, TouchableRipple, useTheme } from 'react-native-paper';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import useImagePicker from 'app/hooks/useImagePicker';
import { Controller, useFormContext } from 'react-hook-form';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useCallback, useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { useDropzoneContext } from 'app/providers';
import LottieView from '../LottieView';
import { withHookForm } from './withHookForm';

export const validation = yup.object({
  avatar: yup.string().nullable().default(null)
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(variant?: 'avatar' | 'logo'): WizardFormStep<StepFields> {
  const { dropzoneUser } = useUserProfileContext();
  const {
    dropzone: { dropzone }
  } = useDropzoneContext();

  return useMemo(
    () => ({
      defaultValues: {
        avatar: variant === 'logo' ? dropzoneUser?.user?.image : dropzone?.banner
      },
      validation
    }),
    [dropzone?.banner, dropzoneUser?.user?.image, variant]
  );
}

export interface IAvatarPickerProps {
  value: string;
  error?: string;
  helperText?: string;
  size?: number;
  onChange(newValue: string): void;
}

function AvatarPicker(props: IAvatarPickerProps) {
  const { size, value, helperText, onChange, error } = props;
  const theme = useTheme();
  const pickImage = useImagePicker();
  const onPress = useCallback(async () => {
    try {
      const base64 = await pickImage();

      if (base64) {
        // Upload image
        onChange(`data:image/jpeg;base64,${base64}`);
      }
    } catch (e) {
      console.log(e);
    }
  }, [onChange, pickImage]);

  return (
    <>
      <TouchableRipple {...{ onPress }}>
        {!value ? (
          <LottieView
            style={{ height: size, width: size }}
            autoPlay
            loop={false}
            source={require('../../../assets/images/image-pick.json')}
          />
        ) : (
          <Avatar.Image
            size={size}
            source={{ uri: value }}
            style={{
              borderWidth: StyleSheet.hairlineWidth,
              backgroundColor: theme.colors.primary
            }}
          />
        )}
      </TouchableRipple>
      <HelperText type={error ? 'error' : 'info'}>{error || helperText || ' '}</HelperText>
    </>
  );
}

export const AvatarPickerField = withHookForm(AvatarPicker);

export default AvatarPicker;
