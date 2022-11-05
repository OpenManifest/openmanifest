import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ActivityIndicator, ProgressBar } from 'react-native-paper';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PortalProvider } from '@gorhom/portal';

import './bootstrap';
import Apollo from 'app/api/Apollo';
import Wrapper from './EntrypointWrapper';

import {
  ExpoUpdatesProvider,
  DropzonesProvider,
  PushNotificationsProvider,
  ThemeProvider,
} from './providers';

import { useRouteChange, useAppearanceListener, useCachedResources } from './hooks';

import { store, persistor, useAppSelector } from '../state/store';
import ImageViewer from '../components/dialogs/ImageViewer/ImageViewer';

import NotificationArea from '../components/notifications/Notifications';
import RootNavigator, { options as LinkingConfiguration } from '../screens/routes';
import {
  AppSignalBoundary,
  AppSignalProvider,
  AppSignalSessionTagger,
} from '../components/app_signal';

function Content() {
  useAppearanceListener();
  const state = useAppSelector((root) => root.global);
  const onRouteChange = useRouteChange();

  return (
    <AppSignalProvider>
      <AppSignalBoundary>
        <ExpoUpdatesProvider>
          <React.Suspense
            fallback={
              <View style={{ flex: 1, flexGrow: 1 }}>
                <ProgressBar indeterminate color={state?.theme?.colors?.primary} visible />
              </View>
            }
          >
            <Apollo>
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
                        <DropzonesProvider>
                          <Wrapper>
                            <AppSignalSessionTagger>
                              <PushNotificationsProvider>
                                <RootNavigator />
                              </PushNotificationsProvider>
                            </AppSignalSessionTagger>
                          </Wrapper>
                        </DropzonesProvider>
                      </NavigationContainer>

                      <StatusBar />
                      <NotificationArea />
                    </SafeAreaProvider>
                  </PortalProvider>
                </GestureHandlerRootView>
              </ThemeProvider>
            </Apollo>
          </React.Suspense>
        </ExpoUpdatesProvider>
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

export default App;
