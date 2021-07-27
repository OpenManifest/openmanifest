import * as React from 'react';
import { Caption, Card, List } from 'react-native-paper';

import { formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';
import { Load, Notification } from '../../../../api/schema';

interface INotification {
  notification: Notification;
}

export default function BoardingCallNotification(props: INotification) {
  const { notification } = props;
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('Manifest', {
          screen: 'LoadScreen',
          initial: false,
          params: { load: notification.resource as Load },
        })
      }
    >
      <Card elevation={2} style={{ borderRadius: 8, margin: 2, width: 370 }}>
        <List.Item
          title={`Load #${(notification.resource as Load).loadNumber} boarding call`}
          description={notification.message}
          style={{ width: '100%' }}
          left={(p) => <List.Icon {...p} icon="airplane-takeoff" />}
          right={() => <Caption>{formatDistanceToNow(notification.createdAt * 1000)}</Caption>}
        />
      </Card>
    </TouchableOpacity>
  );
}
