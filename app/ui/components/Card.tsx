import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '../theme';
import type { SpaceKey } from '../tokens';

export type CardProps = Omit<ViewProps, 'style'> & {
  /** `flat` is outlined, `raised` floats on a shadow */
  variant?: 'flat' | 'raised';
  /** Padding inside, from the spacing scale (default `lg`; `none` for rows that run to the edge) */
  padding?: SpaceKey | 'none';
};

/** A surface that groups related content */
export default function Card({ variant = 'flat', padding = 'lg', ...rest }: CardProps) {
  const theme = useTheme();

  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: theme.colour.surface,
          borderRadius: theme.radius.lg,
          padding: padding === 'none' ? 0 : theme.space[padding],
        },
        variant === 'flat'
          ? { borderWidth: 1, borderColor: theme.colour.border }
          : theme.elevation.raised,
      ]}
    />
  );
}
