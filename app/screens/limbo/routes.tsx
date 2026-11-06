import { NavigationProp, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import OperatorsScreen from './operator_select/OperatorsScreen';

export type LimboRoutes = {
  OperatorSelectScreen: undefined;
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
      initialRouteName="OperatorSelectScreen"
    >
      <Stack.Screen name="OperatorSelectScreen" component={OperatorsScreen} />
    </Stack.Navigator>
  );
}
