import { NavigatorScreenParams, useNavigation } from '@react-navigation/native';
import * as React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerNavigationProp,
} from '@react-navigation/drawer';
import { PortalHost } from '@gorhom/portal';
import Authenticated, { AuthenticatedRoutes } from '../authenticated/routes';
import { UserDrawerContext } from './UserDrawerContext';

export type RightDrawerRoutes = {
  RightDrawer: NavigatorScreenParams<AuthenticatedRoutes>;
};

const Drawer = createDrawerNavigator<RightDrawerRoutes>();

export default function DrawerNavigator() {
  const { openDrawer, closeDrawer } = useNavigation<DrawerNavigationProp<RightDrawerRoutes>>();
  const drawerContent = React.useCallback(
    () => (
      <DrawerContentScrollView
        contentContainerStyle={{ paddingLeft: 0, paddingRight: 0 }}
        style={{ paddingLeft: 0, paddingRight: 0 }}
      >
        <PortalHost name="drawer" />
      </DrawerContentScrollView>
    ),
    []
  );
  const value = React.useMemo(() => ({ openDrawer, closeDrawer }), [closeDrawer, openDrawer]);
  return (
    <UserDrawerContext.Provider {...{ value }}>
      <Drawer.Navigator
        {...{ drawerContent }}
        screenOptions={{
          drawerType: 'front',
          headerShown: false,
          drawerPosition: 'right',
          drawerStyle: { width: 400, paddingHorizontal: 0, paddingLeft: 0, paddingRight: 0 },
        }}
      >
        <Drawer.Screen name="RightDrawer" component={Authenticated} />
      </Drawer.Navigator>
    </UserDrawerContext.Provider>
  );
}
