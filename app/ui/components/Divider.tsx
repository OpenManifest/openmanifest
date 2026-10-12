import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../theme';

export type DividerProps = {
  /** Indent from the start, in dp (the width of a leading icon, so the line lines up with the text) */
  inset?: number;
  /** A vertical line between side-by-side children */
  vertical?: boolean;
  testID?: string;
};

/** A hairline in the border colour */
export default function Divider({ inset = 0, vertical = false, testID }: DividerProps) {
  const { colour } = useTheme();

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
              backgroundColor: colour.border,
            }
          : {
              height: StyleSheet.hairlineWidth,
              marginStart: inset,
              backgroundColor: colour.border,
            }
      }
    />
  );
}
