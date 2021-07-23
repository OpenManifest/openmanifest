import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { DropzoneUser, Slot } from '../../api/schema';
import { useAppSelector } from '../../state';
import LoadScreen from '../../screens/authenticated/load/LoadScreen';
// eslint-disable-next-line max-len
import WeatherConditionsScreen from '../../screens/authenticated/weather_conditions/WeatherConditionsScreen';
import JumpRunScreen from '../../screens/authenticated/weather_conditions/JumpRunScreen';
import WindScreen from '../../screens/authenticated/weather_conditions/WindScreen';
import AppBar from '../AppBar';

import ManifestScreen from '../../screens/authenticated/manifest/ManifestScreen';
import ManifestGroupScreen from '../../screens/authenticated/manifest/ManifestGroupScreen';
// eslint-disable-next-line max-len
import ManifestGroupUserSelectScreen from '../../screens/authenticated/manifest/ManifestGroupUserSelectScreen';

export type IManifestTabParams = {
  DropzoneScreen: undefined;
  LoadScreen: undefined;
  ManifestGroupUserSelectScreen: undefined;
  WeatherConditionsScreen: undefined;
  WindScreen: undefined;
  JumpRunScreen: undefined;
  ManifestGroupScreen: {
    users?: DropzoneUser[];
    slots?: Slot[];
    loadId?: number;
  };
};

const Manifest = createStackNavigator<IManifestTabParams>();

export default function ManifestTab() {
  const globalState = useAppSelector((root) => root.global);
  return (
    <Manifest.Navigator
      screenOptions={{
        headerShown: !!(globalState.credentials && globalState.currentDropzone),
        header: (props) => <AppBar {...props} />,
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
        name="ManifestGroupScreen"
        component={ManifestGroupScreen}
        options={{ title: 'Manifest group' }}
      />
      <Manifest.Screen
        name="ManifestGroupUserSelectScreen"
        component={ManifestGroupUserSelectScreen}
        options={{ title: 'Select users' }}
      />
    </Manifest.Navigator>
  );
}
