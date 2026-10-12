import * as React from 'react';
import { Notification } from 'app/api/schema.d';
import { RigEssentialsFragment } from 'app/api/operations';
import NotificationCard from './NotificationCard';
import useOpenUser from 'app/navigation/useOpenUser';

interface INotification {
  notification: Notification;
}

export default function RigInspectionNotification(props: INotification) {
  const { notification } = props;
  const openUser = useOpenUser();
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
          ? openUser('RigInspectionScreen', {
              rigId: (notification.resource as unknown as RigEssentialsFragment).id,
              membershipId: (notification.resource as unknown as RigEssentialsFragment).owner
                ?.id as string,
            })
          : openUser('ProfileScreen', {
              userId: (notification.resource as unknown as RigEssentialsFragment).owner
                ?.id as string,
            })
      }
    />
  );
}
