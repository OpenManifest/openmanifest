import * as React from 'react';
import { Caption, Card, List } from 'react-native-paper';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../../../../api/schema';

interface INotification {
  notification: Notification;
}

export default function ManifestedNotification(props: INotification) {
  const { notification } = props;
  return (
    <Card style={{ margin: 8, borderRadius: 2, width: 370 }}>
      <List.Item
        title="Manifest"
        description={notification.message}
        style={{ width: '100%' }}
        left={(p) => <List.Icon {...p} icon="airplane" />}
        right={() => <Caption>{formatDistanceToNow(notification.createdAt * 1000)}</Caption>}
      />
    </Card>
  );
}
