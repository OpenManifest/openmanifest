import * as React from 'react';
import { useController } from 'react-hook-form';
import { Avatar, Paragraph, TouchableRipple, useTheme } from 'react-native-paper';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { useDropzoneWizardFields } from '../useDropzoneWizardForm';
import useImagePicker from 'app/hooks/useImagePicker';
import { View, StyleSheet } from 'react-native';
import LottieView from 'app/components/LottieView';

function Logo(props: IWizardStepProps) {
  const { control, setField } = useDropzoneWizardFields();
  const { field } = useController({ name: 'banner', control });
  const pickImage = useImagePicker();
  const onPickImage = React.useCallback(async () => {
    try {
      const base64 = await pickImage();

      if (base64) {
        // Upload image
        setField('banner', `data:image/jpeg;base64,${base64}`);
      } else {
        console.log({ base64 });
      }
    } catch (e) {
      console.log(e);
    }
  }, [pickImage, setField]);
  const theme = useTheme();

  return (
    <Step {...props} title="Banner">
      <Fields>
        <View style={styles.avatarContainer}>
          <TouchableRipple onPress={onPickImage}>
            {!field.value ? (
              <LottieView
                style={{ height: 175, width: 175 }}
                autoPlay
                loop={false}
                source={require('../../../../../assets/images/image-pick.json')}
              />
            ) : (
              <Avatar.Image
                size={175}
                source={{ uri: field.value }}
                style={{
                  borderWidth: StyleSheet.hairlineWidth,
                  backgroundColor: theme.colors.primary,
                }}
              />
            )}
          </TouchableRipple>
          <Paragraph style={{ paddingHorizontal: 48, marginTop: 24 }}>
            Your logo is displayed as an avatar for your dropzone throughout the app.
          </Paragraph>
        </View>
      </Fields>
    </Step>
  );
}

const styles = StyleSheet.create({
  avatarContainer: { marginBottom: 100, alignItems: 'center', justifyContent: 'center' },
  paragraph: { marginTop: 16 },
});
export default Logo;
