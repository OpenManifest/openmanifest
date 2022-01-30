import { HeaderStyleInterpolators, createStackNavigator } from '@react-navigation/stack';

import * as React from 'react';
import { useAppSelector } from 'app/state';
import LoadScreen, { LoadScreenRoute } from './load/LoadScreen';
// eslint-disable-next-line max-len
import WeatherConditionsScreen from './weather_conditions/WeatherConditionsScreen';
import JumpRunScreen from './weather_conditions/JumpRunScreen';
import WindScreen from './weather_conditions/WindScreen';

import ManifestScreen from './manifest/ManifestScreen';

import AppBar from 'app/components/appbar/AppBar';
import { NavigationProp, NavigatorScreenParams, useNavigation } from '@react-navigation/core';
import { LoadDetailsFragment } from 'app/api/operations';
import User, { UserRoutes } from '../user/routes';
import Configuration, { ConfigurationRoutes } from '../configuration/routes';

export type DropzoneRoutes = {
  WeatherConditionsScreen: undefined
  WindScreen: undefined
  ManifestScreen: undefined
  JumpRunScreen: undefined
  User: NavigatorScreenParams<UserRoutes>;
  Configuration: NavigatorScreenParams<ConfigurationRoutes>;
} & LoadScreenRoute;

const Manifest = createStackNavigator<DropzoneRoutes>();

export function useDropzoneNavigation() {
  return useNavigation<NavigationProp<DropzoneRoutes>>();
}

export default function ManifestTab() {
  const globalState = useAppSelector((root) => root.global);

  return (
    <Manifest.Navigator
      screenOptions={{
        headerShown: !!(globalState.credentials && globalState.currentDropzone),
        header: (props) => <AppBar {...props} />,
        headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
        cardStyle: {
          flex: 1,
        },
      }}
    >
      <Manifest.Screen
        name="ManifestScreen"
        component={ManifestScreen}
        options={{ title: 'Manifest' }}
      />
      <Manifest.Screen
        name="WeatherConditionsScreen"
        component={WeatherConditionsScreen}
        options={{ headerShown: false }}
      />
      <Manifest.Screen
        name="WindScreen"
        component={WindScreen}
        options={{ title: 'Winds Aloft' }}
      />
      <Manifest.Screen
        name="JumpRunScreen"
        component={JumpRunScreen}
        options={{ title: 'Jump Run' }}
      />
      <Manifest.Screen name="LoadScreen" component={LoadScreen} options={{ title: 'Load' }} />

      <Manifest.Screen
        name="User"
        component={User}
        options={{ headerShown: false, presentation: 'modal' }}
      />

      <Manifest.Screen
        name="Configuration"
        component={Configuration}
      />
    </Manifest.Navigator>
  );
}
