import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import ScreenHeader from 'app/navigation/ScreenHeader';
import { AppSignalBoundary } from 'app/components/app_signal';
import TodayScreen from 'app/features/today/TodayScreen';

export type TodayRoutes = {
  TodayScreen: undefined;
};

const Today = createStackNavigator<TodayRoutes>();

/** The member's day: where members land (design plan §5.1) */
export default function TodayTab() {
  const { t } = useTranslation('common');
  return (
    <AppSignalBoundary>
      <Today.Navigator
        screenOptions={{
          headerShown: true,
          header: (props) => <ScreenHeader {...props} hideWarnings />,
          cardStyle: { flex: 1 },
        }}
        initialRouteName="TodayScreen"
      >
        <Today.Screen
          name="TodayScreen"
          component={TodayScreen}
          options={{ title: t('destinations.today') }}
        />
      </Today.Navigator>
    </AppSignalBoundary>
  );
}
