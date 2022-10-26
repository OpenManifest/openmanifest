import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import AppBar from 'app/components/appbar/AppBar';

import { NavigatorScreenParams } from '@react-navigation/core';
import { AppSignalBoundary } from 'app/components/app_signal';
import NotificationsScreen from './notifications/NotificationsScreen';
import Users, { UserRoutes } from '../user/routes';

export type NotificationRoutes = {
  NotificationsScreen: undefined;
  RigInspectionScreen: undefined;
  User: NavigatorScreenParams<UserRoutes>;
};

const Notification = createStackNavigator<NotificationRoutes>();

export default function Notifications() {
  return (
    <AppSignalBoundary>
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

        <Notification.Screen name="User" component={Users} />
      </Notification.Navigator>
    </AppSignalBoundary>
  );
}
