import * as React from 'react';
import { Notification } from 'app/api/schema.d';
import NotificationCard from './NotificationCard';

interface INotification {
  notification: Partial<Notification>;
}

export default function PermissionNotification(props: INotification) {
  const { notification } = props;

  return (
    <NotificationCard
      title={
        notification.notificationType === 'permission_granted'
          ? 'Permission granted'
          : 'Permission revoked'
      }
      description={notification.message}
      timestamp={notification.createdAt}
      icon={notification.notificationType === 'permission_granted' ? 'lock-open' : 'lock-alert'}
      onPress={() => null}
    />
  );
}
