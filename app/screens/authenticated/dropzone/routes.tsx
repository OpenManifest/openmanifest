import { HeaderStyleInterpolators, createStackNavigator } from '@react-navigation/stack';

import * as React from 'react';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { Dropzone, DropzoneUser, Order, Slot } from 'app/api/schema.d';
import { useAppSelector } from 'app/state';
import LoadScreen from './load/LoadScreen';
// eslint-disable-next-line max-len
import WeatherConditionsScreen from './weather_conditions/WeatherConditionsScreen';
import JumpRunScreen from './weather_conditions/JumpRunScreen';
import WindScreen from './weather_conditions/WindScreen';

import ManifestScreen from './manifest/ManifestScreen';

import AppBar from 'app/components/AppBar/AppBar';
import { NavigationProp, NavigatorScreenParams, useNavigation } from '@react-navigation/core';
import { LoadDetailsFragment } from 'app/api/operations';
import User, { UserRoutes } from '../user/routes';
import Configuration, { ConfigurationRoutes } from '../configuration/routes';

export type DropzoneRoutes = {
  DropzoneScreen: undefined
  WeatherConditionsScreen: undefined
  WindScreen: undefined
  ManifestScreen: undefined
  JumpRunScreen: undefined
  LoadScreen: {
    load: LoadDetailsFragment;
  };
  User: NavigatorScreenParams<UserRoutes>;
  Configuration: NavigatorScreenParams<ConfigurationRoutes>;
};

const Manifest = createStackNavigator<DropzoneRoutes>();

export function useDropzoneRoutes() {
  return useNavigation<NavigationProp<DropzoneRoutes>>();
}

export default function ManifestTab() {
  const globalState = useAppSelector((root) => root.global);
  const { currentUser } = useCurrentDropzone();

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
        name="DropzoneScreen"
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
      />

      <Manifest.Screen
        name="Configuration"
        component={Configuration}
      />
    </Manifest.Navigator>
  );
}
