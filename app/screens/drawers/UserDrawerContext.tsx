import { NavigatorScreenParams } from '@react-navigation/native';
import * as React from 'react';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { AuthenticatedRoutes } from '../authenticated/routes';

export type RightDrawerRoutes = {
  RightDrawer: NavigatorScreenParams<AuthenticatedRoutes>;
};

export const UserDrawerContext = React.createContext<
  Pick<DrawerNavigationProp<RightDrawerRoutes>, 'openDrawer' | 'closeDrawer'>
>({
  openDrawer: () => null,
  closeDrawer: () => null,
});

export function useOpenUserDrawer() {
  return React.useContext(UserDrawerContext);
}
