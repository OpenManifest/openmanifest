import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as MaterialProvider, ActivityIndicator, ProgressBar } from 'react-native-paper';
import { Appearance, Linking, Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { registerRootComponent } from 'expo';
import * as Sentry from 'sentry-expo';
import URI from 'urijs';
import './PaperDatesPolyfill';
import Wrapper from './EntrypointWrapper';

import AppUpdate from './components/app_update/AppUpdate';

import Apollo from './api/Apollo';
import { store, persistor, useAppSelector, useAppDispatch } from './state/store';
import ImageViewer from './components/dialogs/ImageViewer/ImageViewer';

import useCachedResources from './hooks/useCachedResources';
import NotificationArea from './components/notifications/Notifications';
import LinkingConfiguration from './navigation/Routes';
import RootNavigator from './navigation/RootNavigator';
import { actions } from './state';

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

async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token || null;
}

function Content() {
  const state = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();

  const notificationListener =
    React.useRef<ReturnType<typeof Notifications.addNotificationReceivedListener>>();
  const responseListener =
    React.useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener>>();

  const onOutsideLink = (link: { url: string }) => {
    const uri = URI(link.url);
    const intendedRoute = uri.path();
    console.log(intendedRoute);
  };

  const isDarkMode = Appearance.getColorScheme() === 'dark';

  React.useEffect(() => {
    if (isDarkMode && !state.isDarkMode) {
      dispatch(actions.global.toggleDarkMode());
    } else if (!isDarkMode && state.isDarkMode) {
      dispatch(actions.global.toggleDarkMode());
    } else {
      dispatch(actions.global.setPrimaryColor(state.theme.colors.primary));
    }
  }, [dispatch, isDarkMode, state.isDarkMode, state.theme.colors.primary]);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      return undefined;
    }

    registerForPushNotificationsAsync().then((token: string | null) => {
      if (token) {
        dispatch(actions.global.setExpoPushToken(token));
      }
    });

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      if (notification.request.content.body) {
        dispatch(
          actions.notifications.showSnackbar({
            message: notification.request.content.body,
            variant: 'warning',
          })
        );
      }
    });

    // This listener is fired whenever a user taps on or
    // interacts with a notification (works when app is foregrounded,
    // backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    Linking.addEventListener('url', onOutsideLink);

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
      Linking.removeEventListener('url', onOutsideLink);
    };
  }, [dispatch]);

  return (
    <AppUpdate>
      <React.Suspense
        fallback={
          <View style={{ flex: 1, flexGrow: 1 }}>
            <ProgressBar indeterminate color={state?.theme?.colors?.accent} visible />
          </View>
        }
      >
        <Apollo>
          <MaterialProvider theme={state.theme}>
            <SafeAreaProvider>
              <ImageViewer />
              <NavigationContainer
                linking={LinkingConfiguration}
                theme={state.theme as unknown as never}
              >
                <Wrapper>
                  <RootNavigator />
                </Wrapper>
              </NavigationContainer>

              <StatusBar />
              <NotificationArea />
            </SafeAreaProvider>
          </MaterialProvider>
        </Apollo>
      </React.Suspense>
    </AppUpdate>
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
