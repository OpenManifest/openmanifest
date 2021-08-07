import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import NotificationCard from './NotificationCard';
import { Notification, Rig } from '../../../../api/schema';

interface INotification {
  notification: Notification;
}

export default function RigInspectionNotification(props: INotification) {
  const { notification } = props;
  const navigation = useNavigation();
  return (
    <NotificationCard
      title={
        notification.notificationType === 'rig_inspection_requested'
          ? 'Rig inspection required'
          : 'Rig inspection completed'
      }
      description={notification.message}
      timestamp={notification.createdAt}
      icon={notification.notificationType === 'rig_inspection_requested' ? 'eye' : 'parachute'}
      onPress={() =>
        notification.notificationType === 'rig_inspection_requested'
          ? navigation.navigate('RigInspectionScreen', {
              rig: (notification.resource as Rig).id,
              dropzoneUserId: (notification.resource as Rig).user?.id,
            })
          : navigation.navigate('Manifest', {
              screen: 'Profile',
              params: {
                screen: 'ProfileScreen',
              },
            })
      }
    />
  );
}
