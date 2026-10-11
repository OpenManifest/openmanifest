import { NavigationProp, useNavigation } from '@react-navigation/native';
import type { NotificationRoutes } from './routes';

export function useNotificationNavigation() {
  return useNavigation<NavigationProp<NotificationRoutes>>();
}
