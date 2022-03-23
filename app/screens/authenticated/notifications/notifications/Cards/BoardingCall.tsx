import * as React from 'react';

import { useAuthenticatedNavigation } from 'app/screens/authenticated/useAuthenticatedNavigation';
import { Load, Notification } from 'app/api/schema.d';
import NotificationCard from './NotificationCard';

interface INotification {
  notification: Notification;
}

export default function BoardingCallNotification(props: INotification) {
  const { notification } = props;
  const navigation = useAuthenticatedNavigation();
  return (
    <NotificationCard
      title={`Load #${(notification.resource as Load).loadNumber} boarding call`}
      description={notification.message}
      timestamp={notification.createdAt}
      icon="airplane-takeoff"
      onPress={() =>
        notification?.resource?.id &&
        navigation.navigate('Manifest', {
          screen: 'LoadScreen',
          initial: false,
          params: { loadId: notification.resource.id },
        })
      }
    />
  );
}
