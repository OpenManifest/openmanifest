import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import type { UserRoutes } from 'app/screens/authenticated/user/routes';

/**
 * Opens a screen of the User stack. The stack is registered once, under People (`/user/…`): the tab opens with the list
 * underneath, so Back goes to the list.
 */
export default function useOpenUser() {
  const navigation = useNavigation();

  return React.useCallback(
    <Screen extends keyof UserRoutes>(screen: Screen, params: UserRoutes[Screen]) => {
      navigation.navigate('Authenticated', {
        screen: 'Users',
        params: { screen, params, initial: false },
      } as never);
    },
    [navigation]
  );
}
