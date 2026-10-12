import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import ScreenHeader from 'app/navigation/ScreenHeader';
import { useTranslation } from 'react-i18next';

import { NavigatorScreenParams } from '@react-navigation/native';
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
  const { t } = useTranslation('common');
  return (
    <AppSignalBoundary>
      <Notification.Navigator
        screenOptions={{
          headerShown: true,
          header: (props) => <ScreenHeader {...props} hideWarnings />,
          cardStyle: {
            flex: 1,
          },
        }}
        initialRouteName="NotificationsScreen"
      >
        <Notification.Screen
          name="NotificationsScreen"
          component={NotificationsScreen}
          options={{ title: t('screens.inbox') }}
        />

        <Notification.Screen name="User" component={Users} />
      </Notification.Navigator>
    </AppSignalBoundary>
  );
}
