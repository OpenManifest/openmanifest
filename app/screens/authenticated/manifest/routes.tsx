import { HeaderStyleInterpolators, createStackNavigator } from '@react-navigation/stack';

import * as React from 'react';
import { useSession } from 'app/state';
import ScreenHeader from 'app/navigation/ScreenHeader';
import { useTranslation } from 'react-i18next';
import { NavigatorScreenParams } from '@react-navigation/native';
import { AppSignalBoundary } from 'app/components/app_signal';
import LoadScreen, { LoadScreenRoute } from './load/LoadScreen';

import WeatherConditionsScreen from './weather_conditions/WeatherConditionsScreen';
import JumpRunScreen from './weather_conditions/JumpRunScreen';
import WindScreen from './weather_conditions/WindScreen';
import { WeatherFormProvider } from 'app/forms/weather';

import ManifestScreen from './manifest/ManifestScreen';

import User, { UserRoutes } from '../user/routes';
import Configuration, { ConfigurationRoutes } from '../configuration/routes';

export type OperatorRoutes = {
  WeatherConditionsScreen: undefined;
  WindScreen: undefined;
  ManifestScreen: undefined;
  JumpRunScreen: undefined;
  DashboardScreen: undefined;
  User: NavigatorScreenParams<UserRoutes>;
  Configuration: NavigatorScreenParams<ConfigurationRoutes>;
} & LoadScreenRoute;

const Manifest = createStackNavigator<OperatorRoutes>();

export default function ManifestTab() {
  const { t } = useTranslation(['common', 'terms']);
  const credentials = useSession((session) => session.credentials);
  const currentOperatorId = useSession((session) => session.currentOperatorId);

  return (
    <AppSignalBoundary>
      <WeatherFormProvider>
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
            component={ManifestScreen}
            options={{ title: t('common:destinations.board') }}
          />

          <Manifest.Screen
            name="WeatherConditionsScreen"
            component={WeatherConditionsScreen}
            options={{ headerShown: false }}
          />
          <Manifest.Screen
            name="WindScreen"
            component={WindScreen}
            options={{ title: t('common:screens.windsAloft') }}
          />
          <Manifest.Screen
            name="JumpRunScreen"
            component={JumpRunScreen}
            options={{ title: t('common:screens.jumpRun') }}
          />
          <Manifest.Screen
            name="LoadScreen"
            component={LoadScreen}
            options={{ title: t('terms:load', { count: 1 }) }}
          />

          <Manifest.Screen
            name="User"
            component={User}
            options={{ headerShown: false, presentation: 'modal' }}
          />

          <Manifest.Screen
            name="Configuration"
            component={Configuration}
            options={{ headerShown: false }}
          />
        </Manifest.Navigator>
      </WeatherFormProvider>
    </AppSignalBoundary>
  );
}
