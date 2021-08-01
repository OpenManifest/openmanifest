import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import AppBar from '../AppBar';

import NotificationsScreen from '../../screens/authenticated/notifications/NotificationsScreen';

export type IProfileTabParams = {
  NotificationsScreen: undefined;
};

const Profile = createStackNavigator<IProfileTabParams>();

export default function Notifications() {
  return (
    <Profile.Navigator
      screenOptions={{
        headerShown: true,
        header: (props) => <AppBar {...props} hideWarnings />,
        cardStyle: {
          flex: 1,
        },
      }}
      initialRouteName="NotificationsScreen"
    >
      <Profile.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
    </Profile.Navigator>
  );
}
