import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from './ThemeProvider';
import type { Theme } from './theme';

type Styles<T> = { [K in keyof T]: T[K] };
type NamedStyles = Parameters<typeof StyleSheet.create>[0];

/**
 * Styles from the theme: `const styles = useStyles((t) => ({ row: { padding: t.space.lg, minHeight: t.density.row } }))`.
 * Recomputed only when the theme changes (scheme, brand, breakpoint, pointer or density); pass a factory that is stable
 * (defined at module level) or accept that it re-runs with the theme.
 */
export default function useStyles<T extends NamedStyles>(factory: (theme: Theme) => T): Styles<T> {
  const theme = useTheme();
  // The factory is intentionally not a dependency: it closes over nothing but `theme`
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => StyleSheet.create(factory(theme)), [theme]);
}
