import { HeaderStyleInterpolators, createStackNavigator } from '@react-navigation/stack';

import * as React from 'react';
import { useSession } from 'app/state';
import ScreenHeader from 'app/navigation/ScreenHeader';
import { useTranslation } from 'react-i18next';
import { NavigatorScreenParams } from '@react-navigation/native';
import { AppSignalBoundary } from 'app/components/app_signal';
import { LoadScreenRoute } from './load/LoadScreen';
import { useBoardScreens } from 'app/features/board/screens';

import Configuration, { ConfigurationRoutes } from '../configuration/routes';

export type OperatorRoutes = {
  /** `conditions: 'open'` opens the conditions panel (where the old weather screens lead) */
  ManifestScreen: { conditions?: 'open' } | undefined;
  DashboardScreen: undefined;
  Configuration: NavigatorScreenParams<ConfigurationRoutes>;
} & LoadScreenRoute;

const Manifest = createStackNavigator<OperatorRoutes>();

export default function ManifestTab() {
  const { t } = useTranslation(['common', 'terms']);
  const credentials = useSession((session) => session.credentials);
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const { Board, Load } = useBoardScreens();

  return (
    <AppSignalBoundary>
      <Manifest.Navigator
        screenOptions={{
          headerShown: !!(credentials && currentOperatorId),
          header: (props) => <ScreenHeader {...props} />,
          headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
          cardStyle: {
            flex: 1,
          },
        }}
      >
        <Manifest.Screen
          name="ManifestScreen"
          component={Board}
          options={{ title: t('common:destinations.board') }}
        />

        <Manifest.Screen
          name="LoadScreen"
          component={Load}
          options={{ title: t('terms:load', { count: 1 }) }}
        />

        <Manifest.Screen
          name="Configuration"
          component={Configuration}
          options={{ headerShown: false }}
        />
      </Manifest.Navigator>
    </AppSignalBoundary>
  );
}
