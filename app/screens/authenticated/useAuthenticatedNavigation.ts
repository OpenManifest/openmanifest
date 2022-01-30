import { NavigationProp, useNavigation } from '@react-navigation/core';
import { UserRoutes } from './user/routes';

export function useAuthenticatedNavigation() {
  return useNavigation<NavigationProp<UserRoutes>>();
}
