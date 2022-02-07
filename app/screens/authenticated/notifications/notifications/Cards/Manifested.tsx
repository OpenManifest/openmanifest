import * as React from 'react';
import { Notification } from 'app/api/schema.d';
import { useAuthenticatedNavigation } from 'app/screens/authenticated/useAuthenticatedNavigation';
import NotificationCard from './NotificationCard';

interface INotification {
  notification: Notification;
}

export default function ManifestedNotification(props: INotification) {
  const { notification } = props;
  const navigation = useAuthenticatedNavigation();
  return (
    <NotificationCard
      title="Manifest"
      description={notification.message}
      timestamp={notification.createdAt}
      icon="airplane"
      onPress={() =>
        notification?.resource?.id &&
        navigation.navigate('Manifest', {
          screen: 'LoadScreen',
          initial: false,
          params: { loadId: notification?.resource?.id },
        })
      }
    />
  );
}
