import { HeaderStyleInterpolators, createStackNavigator } from '@react-navigation/stack';

import * as React from 'react';
import { useAppSelector } from 'app/state';
import AppBar from 'app/components/appbar/AppBar';
import { NavigatorScreenParams } from '@react-navigation/core';
import OverviewScreen from './OverviewScreen';
import DashboardScreen from './DashboardScreen';

export type OverviewRoutes = {
  OverviewScreen: undefined;
  DashboardScreen: undefined;
};

const Overview = createStackNavigator<OverviewRoutes>();

export default function OverviewTab() {
  const globalState = useAppSelector((root) => root.global);

  return (
    <Overview.Navigator
      screenOptions={{
        headerShown: !!(globalState.credentials && globalState.currentDropzone),
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
