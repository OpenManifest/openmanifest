import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import ProgressBar from 'app/components/ProgressBar';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PortalProvider } from '@gorhom/portal';

import './bootstrap';
import Apollo from 'app/api/Apollo';
import { NotificationsProvider } from 'app/providers/notifications';
import Wrapper from './EntrypointWrapper';

import {
  ExpoUpdatesProvider,
  DropzonesProvider,
  PushNotificationsProvider,
  ThemeProvider,
} from './providers';

import { useRouteChange, useCachedResources } from './hooks';

import { primaryColor } from '../constants/Colors';
import { useAppTheme } from '../theme';
import { useSession } from '../state/session';
import { usePreferences } from '../state/preferences';
import { ImageViewerProvider } from '../components/dialogs/ImageViewer/context';

import RootNavigator, { options as LinkingConfiguration } from '../screens/routes';
import {
  AppSignalBoundary,
  AppSignalProvider,
  AppSignalSessionTagger,
} from '../components/app_signal';

function ThemedNavigationContainer(
  props: React.PropsWithChildren<{ onStateChange: ReturnType<typeof useRouteChange> }>
) {
  const { theme } = useAppTheme();

  return (
    <NavigationContainer
      documentTitle={{
        formatter: () => 'OpenManifest',
      }}
      onStateChange={props.onStateChange}
      linking={LinkingConfiguration}
      theme={theme}
    >
      {props.children}
    </NavigationContainer>
  );
}

function Content() {
  const onRouteChange = useRouteChange();

  return (
    <AppSignalProvider>
      <AppSignalBoundary>
        <ExpoUpdatesProvider>
          <React.Suspense
            fallback={
              <View style={{ flex: 1, flexGrow: 1 }}>
                <ProgressBar indeterminate color={primaryColor} visible />
              </View>
            }
          >
            <Apollo>
              <ThemeProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <PortalProvider>
                    <SafeAreaProvider>
                      <KeyboardProvider>
                        <ImageViewerProvider>
                          <NotificationsProvider>
                            <ThemedNavigationContainer onStateChange={onRouteChange}>
                              <Wrapper>
                                <DropzonesProvider>
                                  <AppSignalSessionTagger>
                                    <PushNotificationsProvider>
                                      <RootNavigator />
                                    </PushNotificationsProvider>
                                  </AppSignalSessionTagger>
                                </DropzonesProvider>
                              </Wrapper>
                            </ThemedNavigationContainer>

                            <StatusBar />
                          </NotificationsProvider>
                        </ImageViewerProvider>
                      </KeyboardProvider>
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
  // The session (credentials, current dropzone) is restored asynchronously: rendering before that would show the login
  // screen and send the first queries without credentials.
  const sessionHydrated = useSession((session) => session.hydrated);
  const preferencesHydrated = usePreferences((preferences) => preferences.hydrated);

  if (!isLoadingComplete || !sessionHydrated || !preferencesHydrated) {
    console.debug('[App] Loading resources and rendering nothing');
    return null;
  }
  return <Content />;
}

export default App;
