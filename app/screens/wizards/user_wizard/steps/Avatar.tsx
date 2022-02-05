import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Paragraph, TouchableRipple, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { Step, IWizardStepProps, Fields } from 'app/components/navigation_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

function AvatarStep(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.user);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const onPickImage = React.useCallback(async () => {
    try {
      const result = (await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.1,
        base64: true,
      })) as { base64: string };

      if (result?.base64) {
        // Upload image
        dispatch(actions.forms.user.setField(['image', `data:image/jpeg;base64,${result.base64}`]));
      }
    } catch (e) {
      console.log(e);
    }
  }, [dispatch]);

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
