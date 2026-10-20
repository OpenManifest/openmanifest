import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import ScreenHeader from 'app/navigation/ScreenHeader';
import { useTranslation } from 'react-i18next';

import { AppSignalBoundary } from 'app/components/app_signal';
import NotificationsScreen from './notifications/NotificationsScreen';

export type NotificationRoutes = {
  NotificationsScreen: undefined;
  EquipmentInspectionScreen: undefined;
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
      </Notification.Navigator>
    </AppSignalBoundary>
  );
}
