import { NavigationProp, useNavigation } from '@react-navigation/native';
import type { DropzoneRoutes } from './routes';

export function useDropzoneNavigation() {
  return useNavigation<NavigationProp<DropzoneRoutes>>();
}
