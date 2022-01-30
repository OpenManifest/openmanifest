import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import AppBar from 'app/components/appbar/AppBar';

import NotificationsScreen from './notifications/NotificationsScreen';
import Users, { UserRoutes } from '../user/routes';
import { NavigationProp, NavigatorScreenParams, useNavigation } from '@react-navigation/core';

export type NotificationRoutes = {
  NotificationsScreen: undefined;
  RigInspectionScreen: undefined;
  User: NavigatorScreenParams<UserRoutes>;
};

const Notification = createStackNavigator<NotificationRoutes>();

export function useNotificationNavigation() {
  return useNavigation<NavigationProp<NotificationRoutes>>();
}

export default function Notifications() {
  return (
    <Notification.Navigator
      screenOptions={{
        headerShown: true,
        header: (props) => <AppBar {...props} hideWarnings />,
        cardStyle: {
          flex: 1,
        },
      }}
      initialRouteName="NotificationsScreen"
    >
      <Notification.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />

      <Notification.Screen
        name="User"
        component={Users}
      />
    </Notification.Navigator>
  );
}
