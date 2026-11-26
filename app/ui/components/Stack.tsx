import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '../theme';
import type { SpaceKey } from '../tokens';

export type StackProps = Omit<ViewProps, 'style'> & {
  /** Space between the children, from the spacing scale */
  gap?: SpaceKey;
  /** Padding on every side, from the spacing scale */
  padding?: SpaceKey;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  /** Takes the space left in its parent */
  flex?: number | boolean;
};

const ALIGN = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
} as const;
const JUSTIFY = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
} as const;

function Layout({
  direction,
  gap,
  padding,
  align,
  justify,
  wrap,
  flex,
  ...rest
}: StackProps & { direction: 'row' | 'column' }) {
  const { space } = useTheme();

  return (
    <View
      {...rest}
      style={{
        flexDirection: direction,
        gap: gap ? space[gap] : undefined,
        padding: padding ? space[padding] : undefined,
        alignItems: align ? ALIGN[align] : undefined,
        justifyContent: justify ? JUSTIFY[justify] : undefined,
        flexWrap: wrap ? 'wrap' : undefined,
        flex: flex === true ? 1 : flex || undefined,
      }}
    />
  );
}

/** Children one under the other, with a gap from the spacing scale */
export function Stack(props: StackProps) {
  return <Layout {...props} direction="column" />;
}

/** Children side by side, with a gap from the spacing scale */
export function Row(props: StackProps) {
  return <Layout {...props} direction="row" />;
}
