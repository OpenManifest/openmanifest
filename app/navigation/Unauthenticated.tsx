import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import SignupWizard from 'app/screens/unauthenticated/signup/wizard/SignupWizard';
import LoginScreen from '../screens/unauthenticated/login/LoginScreen';
import SignUpScreen from '../screens/unauthenticated/signup/SignUpScreen';

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator();

export default function Unauthenticated() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          flex: 1,
        },
      }}
      mode="modal"
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
      <Stack.Screen name="SignUpWizard" component={SignupWizard} />
    </Stack.Navigator>
  );
}
