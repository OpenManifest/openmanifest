import { HeaderStyleInterpolators, createStackNavigator } from '@react-navigation/stack';

import * as React from 'react';
import { useSession } from 'app/state';
import AppBar from 'app/components/appbar/AppBar';
import OverviewScreen from './AdminOverview';
import DashboardScreen from './DropzoneOverview';

export type OverviewRoutes = {
  OverviewScreen: undefined;
  DashboardScreen: undefined;
};

const Overview = createStackNavigator<OverviewRoutes>();

export default function OverviewTab() {
  const credentials = useSession((session) => session.credentials);
  const currentDropzoneId = useSession((session) => session.currentDropzoneId);

  return (
    <Overview.Navigator
      screenOptions={{
        headerShown: !!(credentials && currentDropzoneId),
        header: (props) => <AppBar {...props} />,
        headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
        cardStyle: {
          flex: 1,
        },
      }}
    >
      <Overview.Screen
        name="DashboardScreen"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Overview.Screen
        name="OverviewScreen"
        component={OverviewScreen}
        options={{ title: 'Overview' }}
      />
    </Overview.Navigator>
  );
}
