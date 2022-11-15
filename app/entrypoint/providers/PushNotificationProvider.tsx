import Constants from 'expo-constants';
import * as React from 'react';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import * as Device from 'expo-device';
import URI from 'urijs';
import { useUpdateUserMutation } from 'app/api/reflection';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { useNotifications } from 'app/providers/notifications';

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

export default function PushNotifications(props: React.PropsWithChildren<object>) {
  const { children } = props;
  const pushToken = useAppSelector((root) => root.global.expoPushToken);
  const notify = useNotifications();
  const dispatch = useAppDispatch();
  const {
    dropzone: { currentUser, loading, called },
  } = useDropzoneContext();
  const notificationListener =
    React.useRef<ReturnType<typeof Notifications.addNotificationReceivedListener>>();
  const responseListener =
    React.useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener>>();

  const onOutsideLink = React.useCallback((link: { url: string }) => {
    const uri = URI(link.url);
    const intendedRoute = uri.path();
    console.log(intendedRoute);
  }, []);

  const [updateUser] = useUpdateUserMutation();
  React.useEffect(() => {
    if (Platform.OS === 'web' || !Device.isDevice) {
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
        notify.info(notification.request.content.body);
      }
    });

    // This listener is fired whenever a user taps on or
    // interacts with a notification (works when app is foregrounded,
    // backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // console.log({ notification: response });
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
  }, [dispatch, notify, onOutsideLink]);

  // Update remote push token if we have a local token, but no
  // token saved on the server. This is done so that the server
  // is able to send us push notifications
  React.useEffect(() => {
    const remoteToken = currentUser?.user?.pushToken;

    if (!loading && currentUser?.id) {
      if (pushToken && pushToken !== remoteToken) {
        updateUser({
          variables: {
            dropzoneUser: Number(currentUser.id),
            pushToken,
          },
        });
      }
    }
  }, [pushToken, currentUser?.id, currentUser?.user?.pushToken, loading, called, updateUser]);
  return children as JSX.Element;
}
