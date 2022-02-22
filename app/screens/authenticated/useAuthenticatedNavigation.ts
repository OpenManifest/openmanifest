import { NavigationProp, useNavigation } from '@react-navigation/core';
import type { AuthenticatedRoutes } from './routes';

export function useAuthenticatedNavigation() {
  return useNavigation<NavigationProp<AuthenticatedRoutes>>();
}
