import { noop } from 'lodash';
import * as React from 'react';

export interface INotification {
  message: string;
  variant?: 'error' | 'success' | 'info';
  createdAt: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}
interface INotificationContext {
  success(message: INotification['message'], action?: INotification['action']): void;
  error(message: INotification['message'], action?: INotification['action']): void;
  info(message: INotification['message'], action?: INotification['action']): void;
}

export const NotificationContext = React.createContext<INotificationContext>({
  success: noop,
  error: noop,
  info: noop,
});

export function useNotifications() {
  return React.useContext(NotificationContext);
}
