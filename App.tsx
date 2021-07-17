import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import Constants from "expo-constants";
import * as Notifications from 'expo-notifications';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react'
import { Provider as MaterialProvider, ActivityIndicator, ProgressBar, Portal } from "react-native-paper"
import { Linking, Platform, View } from 'react-native';
import { NavigationContainer, useLinking } from '@react-navigation/native';
import URI from "urijs";

import Apollo from "./graphql/Apollo";
import { store, persistor, useAppSelector, useAppDispatch } from "./redux/store";

import useCachedResources from './hooks/useCachedResources';
import NotificationArea from './components/notifications/Notifications';
import LinkingConfiguration from './navigation/Routes';
import RootNavigator from "./navigation/RootNavigator";
import { actions } from './redux';
import UserWizardScreen from './components/dialogs/UserWizard/UserWizardScreen';
import DropzoneWizardScreen from './components/dialogs/DropzoneWizard/DropzoneWizard';
import { WeatherConditionsWizard } from './components/dialogs/WeatherConditionsWizard/WeatherConditionsWizard';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
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

  return token;
}

function Content() {
  const state = useAppSelector(state => state.global);
  const dispatch = useAppDispatch();

  const notificationListener = React.useRef<ReturnType<typeof Notifications.addNotificationReceivedListener>>();
  const responseListener = React.useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener>>();

  const onOutsideLink = (link) => {
    console.log(link);
    const uri = URI(link.url);
    const intendedRoute = uri.path();
    console.log(intendedRoute);
  };

  React.useEffect(() => {
    registerForPushNotificationsAsync().then(token => dispatch(actions.global.setExpoPushToken(token)));

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      dispatch(actions.notifications.showSnackbar({ message: notification.request.content.body, variant: "warning" }));
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    Linking.addEventListener("url", onOutsideLink);

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
      Linking.removeEventListener("url", onOutsideLink);
    };
  }, []);

  return (
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
            <NavigationContainer
              linking={LinkingConfiguration}
              theme={state.theme}>
              <RootNavigator />

            </NavigationContainer>

            <StatusBar />
            <UserWizardScreen />
            <DropzoneWizardScreen />
            <WeatherConditionsWizard />
            <NotificationArea />
          </SafeAreaProvider>
        </MaterialProvider>
      </Apollo>
    </React.Suspense>
  )
}
export default function App() {
  const isLoadingComplete = useCachedResources();



  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <Provider store={store}>
        <PersistGate
          persistor={persistor}
          loading={
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" />
            </View>
        }>
          <Content />
        </PersistGate>
      </Provider>
    );
  }
}
