import * as React from 'react';
import { Notification } from 'app/api/schema.d';
import NotificationCard from './NotificationCard';

interface INotification {
  notification: Partial<Notification>;
}

export default function PublicationRequestNotification(props: INotification) {
  const { notification } = props;
  return (
    <NotificationCard
      title="Publication requested"
      description={notification.message}
      timestamp={notification.createdAt}
      icon="progress-upload"
    />
  );
}
