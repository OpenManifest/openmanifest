import { NavigationProp, useNavigation } from '@react-navigation/core';
import type { NotificationRoutes } from './routes';

export function useNotificationNavigation() {
  return useNavigation<NavigationProp<NotificationRoutes>>();
}
