import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import AppBar from 'app/components/AppBar/AppBar';

import NotificationsScreen from './notifications/NotificationsScreen';

export type NotificationRoutes = {
  NotificationsScreen: undefined;
  RigInspectionScreen: undefined;
};

const Profile = createStackNavigator<NotificationRoutes>();

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
