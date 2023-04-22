import { useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { actions, useAppDispatch } from 'app/state';

export default function useProfileWizard() {
  const navigation = useNavigation();
  const {
    dropzone: { currentUser }
  } = useDropzoneContext();
  const dispatch = useAppDispatch();

  return React.useCallback(
    (index?: number) => {
      if (currentUser) {
        dispatch(actions.forms.user.setOriginal(currentUser));
        if (currentUser?.user?.rigs?.length) {
          dispatch(actions.forms.rig.setOriginal(currentUser.user.rigs[0]));
        }

        navigation.navigate('Wizards', {
          screen: 'UserWizardScreen',
          params: {
            dropzoneUserId: currentUser.id,
            index
          }
        });
      }
    },
    [currentUser, dispatch, navigation]
  );
}
