import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import SignupWizard from 'app/screens/unauthenticated/signup/wizard/SignupWizard';
import LoginScreen from './login/LoginScreen';
import SignUpScreen from './signup/SignUpScreen';
import RecoverPasswordScreen from './login/RecoverPasswordScreen';

export type UnauthenticatedRoutes = {
  LoginScreen: undefined;
  SignUpScreen: undefined;
  SignUpWizard: undefined;
  RecoverPasswordScreen: undefined;
};
// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<UnauthenticatedRoutes>();

export default function Unauthenticated() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          flex: 1,
        },
        presentation: 'modal'
      }}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="SignUpWizard" component={SignupWizard} />
      <Stack.Screen name="RecoverPasswordScreen" component={RecoverPasswordScreen} />
    </Stack.Navigator>
  );
}
