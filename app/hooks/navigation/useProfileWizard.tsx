import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { useDropzoneContext } from 'app/providers/dropzone/context';

export default function useProfileWizard() {
  const navigation = useNavigation();
  const {
    dropzone: { currentUser },
  } = useDropzoneContext();

  return React.useCallback(
    (index?: number) => {
      if (currentUser) {
        navigation.navigate('Wizards', {
          screen: 'UserWizardScreen',
          params: {
            dropzoneUserId: currentUser.id,
            index,
          },
        });
      }
    },
    [currentUser, navigation]
  );
}
