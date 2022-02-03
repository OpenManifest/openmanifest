import { NavigationProp, useNavigation } from '@react-navigation/core';
import type { UserRoutes } from './routes';

export function useUserNavigation() {
  return useNavigation<NavigationProp<UserRoutes>>();
}
