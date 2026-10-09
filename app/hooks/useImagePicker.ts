import * as React from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export default function useImagePicker() {
  const onPickImage = React.useCallback(async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        console.error('Sorry, we need camera roll permissions to make this work!');
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
      base64: true,
    });

    // expo-image-picker 14.1 (SDK 48) only returns the picked images in `assets`
    return result.canceled ? undefined : (result.assets?.[0]?.base64 ?? undefined);
  }, []);

  return onPickImage;
}
