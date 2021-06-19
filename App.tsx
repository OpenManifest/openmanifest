import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import Constants from "expo-constants";
import * as Notifications from 'expo-notifications';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react'
import { Provider as MaterialProvider, ActivityIndicator, ProgressBar } from "react-native-paper"
import { Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import Apollo from "./graphql/Apollo";
import { store, persistor, useAppSelector, useAppDispatch } from "./redux/store";

import useCachedResources from './hooks/useCachedResources';
import NotificationArea from './components/notifications/Notifications';
import LinkingConfiguration from './navigation/Routes';
import RootNavigator from "./navigation/RootNavigator";
import { actions } from './redux';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Can use this function below, OR use Expo's Push Notification Tool-> https://expo.io/notifications
async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

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

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
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
