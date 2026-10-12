import * as React from 'react';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useUpdateUserMutation } from 'app/api/reflection';
import { useOperatorContext } from 'app/providers/operator/context';
import { useSession } from 'app/state';
import { useNotifications } from 'app/providers/notifications';

async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;
  if (Device.isDevice) {
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
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data;
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
  const pushToken = useSession((session) => session.expoPushToken);
  const setPushToken = useSession((session) => session.setPushToken);
  const notify = useNotifications();
  const {
    operator: { currentUser, loading, called },
  } = useOperatorContext();
  const notificationListener =
    React.useRef<ReturnType<typeof Notifications.addNotificationReceivedListener>>(undefined);
  const responseListener =
    React.useRef<ReturnType<typeof Notifications.addNotificationResponseReceivedListener>>(
      undefined
    );

  // Links that open the app are routed by React Navigation's linking config
  const onOutsideLink = React.useCallback(() => undefined, []);

  const [updateUser] = useUpdateUserMutation();
  React.useEffect(() => {
    if (Platform.OS === 'web' || !Device.isDevice) {
      return undefined;
    }

    registerForPushNotificationsAsync().then((token: string | null) => {
      if (token) {
        setPushToken(token);
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
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      () => undefined
    );

    const subscription = Linking.addEventListener('url', onOutsideLink);

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      subscription.remove();
    };
  }, [notify, onOutsideLink, setPushToken]);

  // Update remote push token if we have a local token, but no
  // token saved on the server. This is done so that the server
  // is able to send us push notifications
  React.useEffect(() => {
    const remoteToken = currentUser?.user?.pushToken;

    if (!loading && currentUser?.id) {
      if (pushToken && pushToken !== remoteToken) {
        updateUser({
          variables: {
            membership: currentUser.id,
            pushToken,
          },
        });
      }
    }
  }, [pushToken, currentUser?.id, currentUser?.user?.pushToken, loading, called, updateUser]);
  return children as React.JSX.Element;
}
