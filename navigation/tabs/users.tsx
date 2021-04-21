import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import UsersScreen from '../../screens/authenticated/users/UsersScreen';
import UserProfileScreen from '../../screens/authenticated/profile/UserProfileScreen';
import UserRigScreen from '../../screens/authenticated/rig/UserRigScreen';

export type ISettingsTabParams = {
  UsersScreen: undefined;
  UserRigScreen: undefined;
  UserProfileScreen: undefined;
}

const Settings = createStackNavigator<ISettingsTabParams>();

export default function SettingsTab() {
  return (
    <Settings.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          flex: 1
        }
      }}
    >
      <Settings.Screen name="UsersScreen" component={UsersScreen} />
      <Settings.Screen name="UserRigScreen" component={UserRigScreen} />
      <Settings.Screen name="UserProfileScreen" component={UserProfileScreen} />
    </Settings.Navigator>
  );
}
