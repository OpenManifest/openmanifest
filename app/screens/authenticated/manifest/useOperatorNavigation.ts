import { NavigationProp, useNavigation } from '@react-navigation/native';
import type { OperatorRoutes } from './routes';

export function useOperatorNavigation() {
  return useNavigation<NavigationProp<OperatorRoutes>>();
}
