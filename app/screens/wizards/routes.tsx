import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { UserWizardScreen } from 'app/forms/user_wizard';
import { NavigationProp, useNavigation } from '@react-navigation/native';

import OperatorWizardScreen from './operator_wizard/OperatorWizard';
import RecoverPasswordScreen from './recover_password/RecoverPasswordScreen';
import ConfirmUserScreen from './confirm_user/ConfirmUserScreen';
import ChangePasswordScreen from './change_password/ChangePasswordScreen';

export type WizardRoutes = {
  OperatorWizardScreen: undefined;
  UserWizardScreen: {
    index?: number;
    membershipId: string;
  };
  ConfirmUserScreen: undefined;
  RecoverPasswordScreen: undefined;
  ChangePasswordScreen: undefined;
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
        cardStyle: { flex: 1 },
      }}
    >
      <Wizards.Screen name="OperatorWizardScreen" component={OperatorWizardScreen} />
      <Wizards.Screen name="UserWizardScreen" component={UserWizardScreen} />
      <Wizards.Screen name="RecoverPasswordScreen" component={RecoverPasswordScreen} />
      <Wizards.Screen name="ConfirmUserScreen" component={ConfirmUserScreen} />
      <Wizards.Screen name="ChangePasswordScreen" component={ChangePasswordScreen} />
    </Wizards.Navigator>
  );
}
