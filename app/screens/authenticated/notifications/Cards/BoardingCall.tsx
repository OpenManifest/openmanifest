import * as React from 'react';
import { Caption, Card, List } from 'react-native-paper';

import { formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { Load, Notification } from '../../../../api/schema';
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
        navigation.navigate('Manifest', {
          screen: 'LoadScreen',
          initial: false,
          params: { load: notification.resource as Load },
        })
      }
    />
  );
}
