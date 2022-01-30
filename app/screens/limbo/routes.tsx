import { NavigationProp, useNavigation } from '@react-navigation/core';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import DropzonesScreen from './dropzone_select/DropzonesScreen';

export type LimboRoutes = {
  DropzoneSelectScreen: undefined;
};
const Stack = createStackNavigator<LimboRoutes>();

export function useLimboNavigation() {
  return useNavigation<NavigationProp<LimboRoutes>>();
}

export default function Limbo() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          flex: 1,
        },
      }}
      initialRouteName="DropzoneSelectScreen"
    >
      <Stack.Screen name="DropzoneSelectScreen" component={DropzonesScreen} />
    </Stack.Navigator>
  );
}
