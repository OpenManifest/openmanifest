import { NavigationProp, useNavigation } from '@react-navigation/core';
import type { DropzoneRoutes } from './routes';

export function useDropzoneNavigation() {
  return useNavigation<NavigationProp<DropzoneRoutes>>();
}
