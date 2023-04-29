import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Paragraph, useTheme } from 'react-native-paper';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import useImagePicker from 'app/hooks/useImagePicker';
import { useFormContext } from 'react-hook-form';
import { useUserProfileContext } from 'app/api/crud';
import { WizardFormStep } from 'app/hooks/forms/useWizard';
import { useMemo } from 'app/hooks/react';
import * as yup from 'yup';
import { AvatarPickerField } from 'app/components/input/AvatarPicker';

export const validation = yup.object({
  avatar: yup.string().nullable().default(null)
});

type StepFields = { [K in keyof yup.InferType<typeof validation>]: yup.InferType<typeof validation>[K] };

export function useStep(): WizardFormStep<StepFields> {
  const { dropzoneUser } = useUserProfileContext();

  return useMemo(
    () => ({
      defaultValues: {
        avatar: dropzoneUser?.user?.image
      },
      validation
    }),
    [dropzoneUser?.user?.image]
  );
}

function AvatarStep(props: IWizardStepProps) {
  const { control } = useFormContext<StepFields>();
  const theme = useTheme();
  const pickImage = useImagePicker();

  return (
    <Step {...props} title="Avatar">
      <Fields>
        <View style={styles.avatarContainer}>
          <AvatarPickerField {...{ control }} name="avatar" />
          <Paragraph style={styles.paragraph}>Press to upload a photo</Paragraph>
        </View>
      </Fields>
    </Step>
  );
}

const styles = StyleSheet.create({
  avatarContainer: { marginBottom: 100, alignItems: 'center', justifyContent: 'center' },
  paragraph: { marginTop: 16 }
});

export default AvatarStep;
