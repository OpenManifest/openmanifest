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
    const result = (await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.1,
      base64: true,
    })) as { base64: string };

    return result?.base64;
  }, []);

  return onPickImage;
}
