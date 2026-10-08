import { useTheme } from 'react-native-paper';
import type { AppTheme } from 'app/state/global';

/** Paper's `useTheme()` is typed as an MD3 theme; the app provides an MD2 theme merged with the navigation theme. */
export function useAppTheme() {
  return useTheme<AppTheme>();
}
