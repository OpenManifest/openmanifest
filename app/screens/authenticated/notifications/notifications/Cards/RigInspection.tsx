import * as React from 'react';
import { useNavigation } from '@react-navigation/native';
import NotificationCard from './NotificationCard';
import { Notification, Rig } from 'app/schema.d';
import { RigEssentialsFragment } from 'app/api/operations';

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
          ? navigation.navigate('Authenticated', {
            screen: 'Drawer',
            params: {
              screen: 'Manifest',
              params: {
                screen: 'RigInspectionScreen',
                params: {
                  rig: (notification.resource as RigEssentialsFragment),
                  dropzoneUserId: Number((notification.resource as RigEssentialsFragment).user?.id),
                }
              }
            }
          })
          : navigation.navigate('Authenticated', {
            screen: 'Drawer',
            params: {
              screen: 'Manifest',
              params: {
                screen: 'ProfileScreen',
              },
            }
          })
      }
    />
  );
}
