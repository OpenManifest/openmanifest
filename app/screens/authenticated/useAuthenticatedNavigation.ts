import { NavigationProp, useNavigation } from '@react-navigation/core';
import { AuthenticatedRoutes } from './routes';

export function useAuthenticatedNavigation() {
  return useNavigation<NavigationProp<AuthenticatedRoutes>>();
}
