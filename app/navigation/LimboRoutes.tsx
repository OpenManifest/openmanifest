import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import DropzonesScreen from '../screens/authenticated/dropzones/DropzonesScreen';
import CreateDropzoneScreen from '../screens/authenticated/dropzones/CreateDropzoneScreen';

const Stack = createStackNavigator();

export default function Limbo() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          flex: 1,
        },
      }}
      initialRouteName="Dropzones"
    >
      <Stack.Screen name="DropzonesScreen" component={DropzonesScreen} />
      <Stack.Screen name="CreateDropzoneScreen" component={CreateDropzoneScreen} />
    </Stack.Navigator>
  );
}
