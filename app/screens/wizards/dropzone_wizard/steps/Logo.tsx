import * as React from 'react';
import { Avatar, Paragraph, TouchableRipple, useTheme } from 'react-native-paper';
import { Step, Fields, IWizardStepProps } from 'app/components/carousel_wizard';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import useImagePicker from 'app/hooks/useImagePicker';
import { View, StyleSheet } from 'react-native';
import LottieView from 'app/components/LottieView';

function Logo(props: IWizardStepProps) {
  const state = useAppSelector((root) => root.forms.dropzone);
  const dispatch = useAppDispatch();
  const pickImage = useImagePicker();
  const onPickImage = React.useCallback(async () => {
    try {
      const base64 = await pickImage();

      if (base64) {
        // Upload image
        dispatch(actions.forms.dropzone.setField(['banner', `data:image/jpeg;base64,${base64}`]));
      } else {
        console.log({ base64 });
      }
    } catch (e) {
      console.log(e);
    }
  }, [dispatch, pickImage]);
  const theme = useTheme();

  return (
    <Step {...props} title="Banner">
      <Fields>
        <View style={styles.avatarContainer}>
          <TouchableRipple onPress={onPickImage}>
            {!state?.fields?.banner?.value ? (
              <LottieView
                style={{ height: 175, width: 175 }}
                autoPlay
                loop={false}
                // eslint-disable-next-line global-require
                source={require('../../../../../assets/images/image-pick.json')}
              />
            ) : (
              <Avatar.Image
                size={175}
                source={{ uri: state?.fields?.banner?.value }}
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
