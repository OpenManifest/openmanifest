import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { UserWizardScreen } from 'app/forms/user_wizard';
import { NavigationProp, NavigatorScreenParams, useNavigation } from '@react-navigation/core';

import DropzoneWizardScreen from './dropzone_wizard/DropzoneWizard';
import RecoverPasswordScreen from './recover_password/RecoverPasswordScreen';
import ConfirmUserScreen from './confirm_user/ConfirmUserScreen';
import ChangePasswordScreen from './change_password/ChangePasswordScreen';
import User, { UserRoutes } from '../authenticated/user/routes';

export type WizardRoutes = {
  DropzoneWizardScreen: undefined;
  UserWizardScreen: {
    index?: number;
    dropzoneUserId: string;
  };
  ConfirmUserScreen: undefined;
  RecoverPasswordScreen: undefined;
  ChangePasswordScreen: undefined;
  User: NavigatorScreenParams<UserRoutes>;
};

const Wizards = createStackNavigator<WizardRoutes>();

export function useWizardRoutes() {
  return useNavigation<NavigationProp<WizardRoutes>>();
}

export default function Routes() {
  return (
    <Wizards.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
        cardStyle: { flex: 1 }
      }}
    >
      <Wizards.Screen name="DropzoneWizardScreen" component={DropzoneWizardScreen} />
      <Wizards.Screen name="UserWizardScreen" component={UserWizardScreen} />
      <Wizards.Screen name="RecoverPasswordScreen" component={RecoverPasswordScreen} />
      <Wizards.Screen name="ConfirmUserScreen" component={ConfirmUserScreen} />
      <Wizards.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
      <Wizards.Screen name="User" component={User} />
    </Wizards.Navigator>
  );
}
