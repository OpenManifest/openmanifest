import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { useOperatorContext } from 'app/providers/operator/context';

export default function useProfileWizard() {
  const navigation = useNavigation();
  const {
    operator: { currentUser },
  } = useOperatorContext();

  return React.useCallback(
    (index?: number) => {
      if (currentUser) {
        navigation.navigate('Wizards', {
          screen: 'UserWizardScreen',
          params: {
            membershipId: currentUser.id,
            index,
          },
        });
      }
    },
    [currentUser, navigation]
  );
}
