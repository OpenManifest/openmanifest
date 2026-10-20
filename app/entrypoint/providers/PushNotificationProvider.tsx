import * as React from 'react';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { NavigationContainerRefContext } from '@react-navigation/native';
import { useApolloClient } from '@apollo/client';
import {
  UnseenNotificationsDocument,
  useMarkNotificationSeenMutation,
  useUpdateUserMutation,
} from 'app/api/reflection';
import { openPush } from 'app/features/inbox/openTarget';
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
  const container = React.useContext(NavigationContainerRefContext);
  const client = useApolloClient();
  const [markSeen] = useMarkNotificationSeenMutation();
  // The tap on a push, held until the member is signed in and the navigator is up (the app may have been started by it)
  const [tapped, setTapped] = React.useState<Notifications.NotificationResponse | null>(null);
  const opened = React.useRef<string | null>(null);
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
      // The badge of the inbox follows
      client.refetchQueries({ include: [UnseenNotificationsDocument] });
    });

    // This listener is fired whenever a user taps on or
    // interacts with a notification (works when app is foregrounded,
    // backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(setTapped);
    // The push that started the app
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) setTapped(response);
    });

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
  }, [client, notify, onOutsideLink, setPushToken]);

  // A tap on a push opens the screen of its type: Today for calls and changes of the manifest, the Wallet for money, the
  // Inbox for the rest; the notification is read by then
  React.useEffect(() => {
    if (!tapped || !currentUser?.id || !container?.isReady()) return;
    // The same tap is not opened twice (the app can hand it over again)
    const key = `${tapped.notification.request.identifier}:${tapped.actionIdentifier}`;
    if (opened.current === key) return;
    opened.current = key;
    const push = openPush(
      (name, params) =>
        (container.navigate as unknown as (screen: string, options: object) => void)(name, params),
      tapped.notification.request.content.data
    );
    if (push?.notificationId) {
      markSeen({
        variables: { id: Number(push.notificationId) },
        refetchQueries: [UnseenNotificationsDocument],
      });
    }
  }, [container, currentUser?.id, markSeen, tapped]);

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
