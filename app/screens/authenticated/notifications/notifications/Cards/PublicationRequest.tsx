import * as React from 'react';
import NotificationCard from './NotificationCard';
import { Notification } from 'app/api/schema.d';

interface INotification {
  notification: Notification;
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
