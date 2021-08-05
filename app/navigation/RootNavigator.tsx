/* eslint-disable no-nested-ternary */
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';

import NotFoundScreen from '../screens/NotFoundScreen';
import { useAppSelector } from '../state/store';

import AuthenticatedRoutes from './Authenticated';
import LimboRoutes from './LimboRoutes';
import UnauthenticatedRoutes from './Unauthenticated';
import DropzonesScreen from '../screens/authenticated/dropzones/DropzonesScreen';
import DropzoneSetupScreen from '../screens/authenticated/dropzone_setup/DropzoneSetupScreen';
import ConfirmUserScreen from '../screens/unauthenticated/signup/ConfirmUserScreen';
import DrawerMenu from './drawer/Drawer';

export type TRootNavigatorRouteParams = {
  Authenticated: undefined;
  Unauthenticated: undefined;
  // eslint-disable-next-line camelcase
  confirm: { account_confirmation_success?: boolean };
  Dropzones: undefined;
  DropzonesScreen: undefined;
  DropzoneSetupScreen: undefined;
  NotFound: undefined;
};

export type TDrawerNavigatorRouteParams = {
  Authenticated: undefined;
  Profile: undefined;
  Settings: undefined;
};
// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<TRootNavigatorRouteParams>();
const Drawer = createDrawerNavigator<TDrawerNavigatorRouteParams>();

export default function RootNavigator() {
  const globalState = useAppSelector((root) => root.global);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          flex: 1,
        },
      }}
    >
      {globalState.credentials ? (
        globalState.currentDropzone ? (
          <Stack.Screen name="Authenticated">
            {() => (
              <Drawer.Navigator drawerContent={() => <DrawerMenu />}>
                <Drawer.Screen name="Authenticated" component={AuthenticatedRoutes} />
              </Drawer.Navigator>
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Dropzones" component={LimboRoutes} />
        )
      ) : (
        <Stack.Screen name="Unauthenticated" component={UnauthenticatedRoutes} />
      )}
      <Stack.Screen name="DropzoneSetupScreen" component={DropzoneSetupScreen} />
      <Stack.Screen name="confirm" component={ConfirmUserScreen} />
      <Stack.Screen name="DropzonesScreen" component={DropzonesScreen} />

      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}
