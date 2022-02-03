import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import { Notification } from 'app/api/schema.d';
import NotificationCard from './NotificationCard';

interface INotification {
  notification: Notification;
}

export default function ManifestedNotification(props: INotification) {
  const { notification } = props;
  const navigation = useNavigation();
  return (
    <NotificationCard
      title="Manifest"
      description={notification.message}
      timestamp={notification.createdAt}
      icon="airplane"
      onPress={() =>
        notification?.resource?.id &&
        navigation.navigate('Authenticated', {
          screen: 'Drawer',
          params: {
            screen: 'Manifest',
            params: {
              screen: 'LoadScreen',
              initial: false,
              params: { loadId: notification?.resource?.id },
            },
          },
        })
      }
    />
  );
}
