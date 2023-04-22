import { useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { actions, useAppDispatch } from 'app/state';

export default function useProfileWizard() {
  const navigation = useNavigation();
  const {
    dropzone: { currentUser }
  } = useDropzoneContext();

  return React.useCallback(
    (index?: number) => {
      if (currentUser) {
        navigation.navigate('Wizards', {
          screen: 'UserWizardScreen',
          params: {
            dropzoneUserId: currentUser.id,
            index
          }
        });
      }
    },
    [currentUser, navigation]
  );
}
