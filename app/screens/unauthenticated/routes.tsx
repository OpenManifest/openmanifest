import { createStackNavigator } from '@react-navigation/stack';
import { NavigationProp, useNavigation } from '@react-navigation/core';
import * as React from 'react';

import LoginScreen from './login/LoginScreen';
import SignUpScreen from './signup/SignUpScreen';

export type UnauthenticatedRoutes = {
  LoginScreen: undefined;
  SignUpScreen: undefined;
  SignUpWizard: undefined;
};
// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<UnauthenticatedRoutes>();
export function useUnauthenticatedNavigation() {
  return useNavigation<NavigationProp<UnauthenticatedRoutes>>();
}

export default function Unauthenticated() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          flex: 1,
        },
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
    </Stack.Navigator>
  );
}
