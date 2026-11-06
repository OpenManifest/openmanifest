import { HeaderStyleInterpolators, createStackNavigator } from '@react-navigation/stack';

import * as React from 'react';
import { useSession } from 'app/state';
import ScreenHeader from 'app/navigation/ScreenHeader';
import { useTranslation } from 'react-i18next';
import PlatformScreen from 'app/features/reports/PlatformScreen';
import ReportsScreen from 'app/features/reports/ReportsScreen';

export type OverviewRoutes = {
  OverviewScreen: undefined;
  DashboardScreen: undefined;
};

const Overview = createStackNavigator<OverviewRoutes>();

export default function OverviewTab() {
  const { t } = useTranslation('common');
  const credentials = useSession((session) => session.credentials);
  const currentOperatorId = useSession((session) => session.currentOperatorId);

  return (
    <Overview.Navigator
      screenOptions={{
        headerShown: !!(credentials && currentOperatorId),
        header: (props) => <ScreenHeader {...props} />,
        headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
        cardStyle: {
          flex: 1,
        },
      }}
    >
      <Overview.Screen
        name="DashboardScreen"
        component={ReportsScreen}
        options={{ title: t('destinations.reports') }}
      />
      <Overview.Screen
        name="OverviewScreen"
        component={PlatformScreen}
        options={{ title: t('destinations.platform') }}
      />
    </Overview.Navigator>
  );
}
