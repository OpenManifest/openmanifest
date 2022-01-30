import * as React from 'react';

import { useNavigation } from '@react-navigation/native';
import { Load, Notification } from 'app/api/schema.d';
import NotificationCard from './NotificationCard';

interface INotification {
  notification: Notification;
}

export default function BoardingCallNotification(props: INotification) {
  const { notification } = props;
  const navigation = useNavigation();
  return (
    <NotificationCard
      title={`Load #${(notification.resource as Load).loadNumber} boarding call`}
      description={notification.message}
      timestamp={notification.createdAt}
      icon="airplane-takeoff"
      onPress={() =>
        notification?.resource?.id && navigation.navigate('Authenticated', {
          screen: 'Drawer',
          params: {
            screen: 'Manifest',
            params: {
              screen: 'LoadScreen',
                initial: false,
                params: { loadId: notification.resource.id },
              }
          }
        })
      }
    />
  );
}
