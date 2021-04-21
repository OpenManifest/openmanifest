import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import PackingScreen from '../../screens/authenticated/packing/PackingScreen';

export type IPackingTabParams = {
  PackingScreen: undefined;
}

const Packing = createStackNavigator<IPackingTabParams>();

export default function PackingTab() {
  return (
    <Packing.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          flex: 1
        }
      }}
    >
      <Packing.Screen name="PackingScreen" component={PackingScreen} />
    </Packing.Navigator>
  );
}
