import { capitalize } from 'lodash';
import * as React from 'react';
import { Notification, Transaction } from '../../../../api/schema';
import NotificationCard from './NotificationCard';

interface INotification {
  notification: Notification;
}

function getIcon(status?: string | null) {
  switch (status) {
    case 'paid':
      return 'cash';
    case 'refunded':
      return 'cash-refund';
    case 'deposit':
      return 'bank-transfer-in';
    case 'withdrawal':
      return 'bank-transfer-out';
    default:
      return 'cash';
  }
}

export default function FundsNotification(props: INotification) {
  const { notification } = props;

  return (
    <NotificationCard
      title={capitalize((notification.resource as Transaction).status || '')}
      description={notification.message}
      timestamp={notification.createdAt}
      icon={getIcon((notification.resource as Transaction)?.status)}
      onPress={() => null}
    />
  );
}
