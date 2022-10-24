import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import Constants from 'app/constants/expo';
import * as Notifications from 'expo-notifications';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, ProgressBar } from 'react-native-paper';
import { Appearance, Platform, View } from 'react-native';
import { NavigationContainer, NavigationState, getPathFromState } from '@react-navigation/native';
import { registerRootComponent } from 'expo';
import * as Sentry from 'sentry-expo';
import { PortalProvider } from '@gorhom/portal';

import Geocoder from 'react-native-geocoding';
import { setGoogleApiKey } from 'expo-location';
import PushNotifications from './PushNotificationProvider';
/* eslint-disable import/no-unresolved */
import './PaperDatesPolyfill';
import Wrapper from './EntrypointWrapper';

import AppUpdate from './components/app_update/AppUpdate';

import Apollo from './api/Apollo';
import { store, persistor, useAppSelector, useAppDispatch } from './state/store';
import ImageViewer from './components/dialogs/ImageViewer/ImageViewer';

import useCachedResources from './hooks/useCachedResources';
import NotificationArea from './components/notifications/Notifications';
import RootNavigator, { options as LinkingConfiguration } from './screens/routes';
import { actions } from './state';
import ThemeProvider from './ThemeProvider';
import {
  AppSignalBoundary,
  AppSignalProvider,
  AppSignalSessionTagger,
} from './components/app_signal';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enableInExpoDevelopment: true,
  debug: true,
});

const googleMapsApiKey = Platform.select({
  ios: Constants?.extra?.googleMapsIos,
  android: Constants?.extra?.googleMapsAndroid,
  web: Constants?.extra?.googleMapsWeb,
});

Geocoder.init(googleMapsApiKey);
setGoogleApiKey(googleMapsApiKey);

function Content() {
  const state = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();

  const listener = React.useRef<ReturnType<typeof Appearance.addChangeListener>>(
    Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        dispatch(actions.global.setAppearance(colorScheme));
      }
    })
  );

  /// Listen to changes in Appearance and set dark mode theme in state
  React.useEffect(() => {
    const handler = listener?.current;
    return () => handler?.remove?.();
  }, [dispatch, state.isDarkMode, state.theme.colors.background]);

  const onRouteChange = React.useCallback(
    (s?: NavigationState) => {
      if (s) {
        const [path] = getPathFromState(s).split(/\?/);
        const [screenName] = path.split(/\//).reverse();
        if (state.currentRouteName !== screenName) {
          dispatch(actions.global.setCurrentRouteName(screenName));
        }
      }
    },
    [dispatch, state.currentRouteName]
  );

  return (
    <AppSignalProvider>
      <AppSignalBoundary>
        <AppUpdate>
          <React.Suspense
            fallback={
              <View style={{ flex: 1, flexGrow: 1 }}>
                <ProgressBar indeterminate color={state?.theme?.colors?.primary} visible />
              </View>
            }
          >
            <Apollo>
              <AppSignalSessionTagger>
                <ThemeProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <PortalProvider>
                      <SafeAreaProvider>
                        <ImageViewer />
                        <NavigationContainer
                          onStateChange={onRouteChange}
                          linking={LinkingConfiguration}
                          theme={state.theme as unknown as never}
                        >
                          <Wrapper>
                            <PushNotifications>
                              <RootNavigator />
                            </PushNotifications>
                          </Wrapper>
                        </NavigationContainer>

                        <StatusBar />
                        <NotificationArea />
                      </SafeAreaProvider>
                    </PortalProvider>
                  </GestureHandlerRootView>
                </ThemeProvider>
              </AppSignalSessionTagger>
            </Apollo>
          </React.Suspense>
        </AppUpdate>
      </AppSignalBoundary>
    </AppSignalProvider>
  );
}
function App() {
  const isLoadingComplete = useCachedResources();

  if (!isLoadingComplete) {
    return null;
  }
  return (
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
        loading={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        }
      >
        <Content />
      </PersistGate>
    </Provider>
  );
}

export default registerRootComponent(App);
