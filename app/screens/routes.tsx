import { NavigatorScreenParams } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import NotFoundScreen from './NotFoundScreen';
import { useSession } from '../state';

import Limbo, { LimboRoutes } from './limbo/routes';
import Unauthenticated, { UnauthenticatedRoutes } from './unauthenticated/routes';
import Wizards, { WizardRoutes } from './wizards/routes';
import Authenticated, { AuthenticatedRoutes } from './authenticated/routes';
import SpikeScreen from './dev/SpikeScreen';
import { options, SPIKE_ENABLED } from '../navigation/linking';

export { options };

export type Routes = {
  Authenticated: NavigatorScreenParams<AuthenticatedRoutes>;
  Unauthenticated: NavigatorScreenParams<UnauthenticatedRoutes>;
  Limbo: NavigatorScreenParams<LimboRoutes>;
  Wizards: NavigatorScreenParams<WizardRoutes>;
  NotFound: undefined;
  Spike: undefined;
};

const Stack = createStackNavigator<Routes>();
declare global {
  namespace ReactNavigation {
    // rome-ignore lint/suspicious/noEmptyInterface: Required
    interface RootParamList extends Routes {}
  }
}

export default function RootNavigator() {
  const credentials = useSession((session) => session.credentials);
  const currentOperatorId = useSession((session) => session.currentOperatorId);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          flex: 1,
        },
      }}
    >
      {credentials ? (
        currentOperatorId ? (
          <Stack.Screen name="Authenticated" component={Authenticated} />
        ) : (
          <Stack.Screen name="Limbo" component={Limbo} />
        )
      ) : (
        <Stack.Screen name="Unauthenticated" component={Unauthenticated} />
      )}
      <Stack.Screen name="Wizards" component={Wizards} />
      {SPIKE_ENABLED ? <Stack.Screen name="Spike" component={SpikeScreen} /> : null}

      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}
