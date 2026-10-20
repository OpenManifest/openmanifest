import * as React from 'react';
import { Notification } from 'app/api/schema.d';
import { EquipmentEssentialsFragment } from 'app/api/operations';
import NotificationCard from './NotificationCard';
import useOpenUser from 'app/navigation/useOpenUser';

interface INotification {
  notification: Notification;
}

export default function EquipmentInspectionNotification(props: INotification) {
  const { notification } = props;
  const openUser = useOpenUser();
  return (
    <NotificationCard
      title={
        notification.notificationType === 'equipment_inspection_requested'
          ? 'Rig inspection required'
          : 'Rig inspection completed'
      }
      description={notification.message}
      timestamp={notification.createdAt}
      icon={
        notification.notificationType === 'equipment_inspection_requested' ? 'eye' : 'parachute'
      }
      onPress={() =>
        notification.notificationType === 'equipment_inspection_requested'
          ? openUser('EquipmentInspectionScreen', {
              equipmentId: (notification.resource as unknown as EquipmentEssentialsFragment).id,
              membershipId: (notification.resource as unknown as EquipmentEssentialsFragment).owner
                ?.id as string,
            })
          : openUser('ProfileScreen', {
              userId: (notification.resource as unknown as EquipmentEssentialsFragment).owner
                ?.id as string,
            })
      }
    />
  );
}
