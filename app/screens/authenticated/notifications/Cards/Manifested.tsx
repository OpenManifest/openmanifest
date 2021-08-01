import * as React from 'react';
import { Caption, Card, List } from 'react-native-paper';
import { formatDistanceToNow } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import { Notification, Slot } from '../../../../api/schema';

interface INotification {
  notification: Notification;
}

export default function ManifestedNotification(props: INotification) {
  const { notification } = props;
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('Manifest', {
          screen: 'LoadScreen',
          initial: false,
          params: { load: (notification.resource as Slot).load },
        })
      }
    >
      <Card style={{ margin: 8, borderRadius: 2, width: 370 }}>
        <List.Item
          title="Manifest"
          description={notification.message}
          style={{ width: '100%' }}
          left={(p) => <List.Icon {...p} icon="airplane" />}
          right={() => <Caption>{formatDistanceToNow(notification.createdAt * 1000)}</Caption>}
        />
      </Card>
    </TouchableOpacity>
  );
}
