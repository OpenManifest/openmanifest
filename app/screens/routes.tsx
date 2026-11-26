import { NavigatorScreenParams } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import NotFoundScreen from './NotFoundScreen';
import { useSession } from '../state';

import Limbo, { LimboRoutes } from './limbo/routes';
import Unauthenticated, { UnauthenticatedRoutes } from './unauthenticated/routes';
import Wizards, { WizardRoutes } from './wizards/routes';
import Authenticated, { AuthenticatedRoutes } from './authenticated/routes';
import OverlaysScreen from './dev/OverlaysScreen';
import FormsScreen from './dev/FormsScreen';
import { GALLERY_ENABLED } from '../constants/gallery';
import { options } from '../navigation/linking';
import GalleryScreen from './dev/gallery/GalleryScreen';

export { options };

export type Routes = {
  Authenticated: NavigatorScreenParams<AuthenticatedRoutes>;
  Unauthenticated: NavigatorScreenParams<UnauthenticatedRoutes>;
  Limbo: NavigatorScreenParams<LimboRoutes>;
  Wizards: NavigatorScreenParams<WizardRoutes>;
  NotFound: undefined;
  Gallery: undefined;
  Overlays: undefined;
  Forms: undefined;
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
      {GALLERY_ENABLED ? <Stack.Screen name="Gallery" component={GalleryScreen} /> : null}
      {GALLERY_ENABLED ? <Stack.Screen name="Overlays" component={OverlaysScreen} /> : null}
      {GALLERY_ENABLED ? <Stack.Screen name="Forms" component={FormsScreen} /> : null}

      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}
