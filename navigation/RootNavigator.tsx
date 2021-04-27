import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import NotFoundScreen from '../screens/NotFoundScreen';
import { useAppSelector } from '../redux/store';
import AppBar from "./AppBar";

import AuthenticatedRoutes from './Authenticated';
import LimboRoutes from './LimboRoutes';
import UnauthenticatedRoutes from './Unauthenticated';

export type TRootNavigatorRouteParams = {
  Authenticated: undefined;
  Unauthenticated: undefined;
  Dropzones: undefined;
  NotFound: undefined;
}
// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<TRootNavigatorRouteParams>();

export default function RootNavigator() {
  const globalState = useAppSelector(state => state.global);

  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          flex: 1
        }
      }}
    >
      {
        globalState.credentials
          ? (
            globalState.currentDropzone
              ? <Stack.Screen name="Authenticated" component={AuthenticatedRoutes} /> :
                <Stack.Screen name="Dropzones" component={LimboRoutes} />
          ) : (
            <Stack.Screen name="Unauthenticated" component={UnauthenticatedRoutes} />
        )
      }
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}
