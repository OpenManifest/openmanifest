import * as React from 'react';
import { Caption, Card, List } from 'react-native-paper';

import { formatDistanceToNow } from 'date-fns';
import { Load, Notification } from '../../../../api/schema';

interface INotification {
  notification: Notification;
}

export default function BoardingCallNotification(props: INotification) {
  const { notification } = props;
  return (
    <Card elevation={2} style={{ borderRadius: 8, margin: 2, width: 370 }}>
      <List.Item
        title={`Load #${(notification.resource as Load).loadNumber} boarding call`}
        description={notification.message}
        style={{ width: '100%' }}
        left={(p) => <List.Icon {...p} icon="airplane-takeoff" />}
        right={() => <Caption>{formatDistanceToNow(notification.createdAt * 1000)}</Caption>}
      />
    </Card>
  );
}
