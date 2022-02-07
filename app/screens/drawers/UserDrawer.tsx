import { NavigatorScreenParams } from '@react-navigation/native';
import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import DrawerMenu from 'app/components/drawer/Drawer';
import RightDrawer, { RightDrawerRoutes } from './DialogDrawer';

export type LeftDrawerRoutes = {
  LeftDrawer: NavigatorScreenParams<RightDrawerRoutes>;
};

const Drawer = createDrawerNavigator<LeftDrawerRoutes>();

export default function DrawerNavigator() {
  const drawerContent = React.useCallback(() => <DrawerMenu />, []);
  return (
    <Drawer.Navigator
      {...{ drawerContent }}
      screenOptions={{ drawerType: 'back', headerShown: false }}
    >
      <Drawer.Screen name="LeftDrawer" component={RightDrawer} />
    </Drawer.Navigator>
  );
}
