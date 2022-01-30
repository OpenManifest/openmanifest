import * as React from 'react';
import NotificationCard from './NotificationCard';
import { Notification } from 'app/api/schema.d';
import { RigEssentialsFragment } from 'app/api/operations';
import { useNotificationNavigation } from '../../routes';

interface INotification {
  notification: Notification;
}

export default function RigInspectionNotification(props: INotification) {
  const { notification } = props;
  const navigation = useNotificationNavigation();
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
          ? navigation.navigate('User', {
              screen: 'RigInspectionScreen',
              params: {
                rigId: (notification.resource as RigEssentialsFragment).id,
                dropzoneUserId: (notification.resource as RigEssentialsFragment).user?.id as string,
              }
            })
          : navigation.navigate('User', {
              screen: 'ProfileScreen',
              params: { userId: (notification.resource as RigEssentialsFragment).user?.id as string }
            })
      }
    />
  );
}
