import { NavigationProp, useNavigation } from '@react-navigation/native';
import type { AuthenticatedRoutes } from './routes';

export function useAuthenticatedNavigation() {
  return useNavigation<NavigationProp<AuthenticatedRoutes>>();
}
