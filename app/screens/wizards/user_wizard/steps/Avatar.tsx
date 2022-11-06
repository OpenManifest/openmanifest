import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Paragraph, TouchableRipple, useTheme } from 'react-native-paper';
import { Step, IWizardStepProps, Fields } from 'app/components/carousel_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import useImagePicker from 'app/hooks/useImagePicker';

function AvatarStep(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.user);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const pickImage = useImagePicker();
  const onPickImage = React.useCallback(async () => {
    try {
      const base64 = await pickImage();

      if (base64) {
        // Upload image
        dispatch(actions.forms.user.setField(['image', `data:image/jpeg;base64,${base64}`]));
      }
    } catch (e) {
      console.log(e);
    }
  }, [dispatch, pickImage]);

  return (
    <Step {...props} title="Avatar">
      <Fields>
        <View style={styles.avatarContainer}>
          <TouchableRipple onPress={onPickImage}>
            {!state?.fields?.image?.value ? (
              <Avatar.Icon size={175} icon="camera" />
            ) : (
              <Avatar.Image
                size={175}
                source={{ uri: state?.fields?.image?.value }}
                style={{
                  backgroundColor: theme.colors.primary,
                }}
              />
            )}
          </TouchableRipple>
          <Paragraph style={styles.paragraph}>Press to upload a photo</Paragraph>
        </View>
      </Fields>
    </Step>
  );
}

const styles = StyleSheet.create({
  avatarContainer: { marginBottom: 100, alignItems: 'center', justifyContent: 'center' },
  paragraph: { marginTop: 16 },
});

export default AvatarStep;
