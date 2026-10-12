import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';
import type { SpaceKey } from '../tokens';

export type DividerProps = {
  /** Indent from the start, in dp (the width of a leading icon, so the line lines up with the text) */
  inset?: number;
  /** A vertical line between side-by-side children */
  vertical?: boolean;
  /** Space above and below (or beside a vertical one), from the spacing scale */
  spacing?: SpaceKey;
  testID?: string;
};

/** A hairline in the border colour */
export default function Divider({ inset = 0, vertical = false, spacing, testID }: DividerProps) {
  const { colour, space } = useTheme();
  const margin = spacing ? space[spacing] : undefined;

  return (
    <View
      testID={testID}
      role="separator"
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
      style={
        vertical
          ? {
              width: StyleSheet.hairlineWidth,
              alignSelf: 'stretch',
              marginHorizontal: margin,
              backgroundColor: colour.border,
            }
          : {
              height: StyleSheet.hairlineWidth,
              marginStart: inset,
              marginVertical: margin,
              backgroundColor: colour.border,
            }
      }
    />
  );
}
