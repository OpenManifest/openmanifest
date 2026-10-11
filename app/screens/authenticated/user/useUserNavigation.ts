import { NavigationProp, useNavigation } from '@react-navigation/native';
import type { UserRoutes } from './routes';

export function useUserNavigation() {
  return useNavigation<NavigationProp<UserRoutes>>();
}
