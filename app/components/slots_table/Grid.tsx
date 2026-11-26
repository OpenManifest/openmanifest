import * as React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Tappable, Text, useTheme } from 'app/ui';

type RowProps = {
  children: React.ReactNode;
  /** Makes the row a button with this name */
  onPress?(): void;
  /** The name of a pressable row: what a screen reader says for it */
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
};

/** A row of the classic slots table: cells side by side over a hairline; a button when it can be pressed */
export function TableRow({ children, onPress, label, disabled, style, testID }: RowProps) {
  const theme = useTheme();
  const row: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: theme.density.row,
    paddingHorizontal: theme.space.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colour.border,
    ...style,
  };

  if (!onPress) {
    return (
      <View testID={testID} style={row}>
        {children}
      </View>
    );
  }
  return (
    <Tappable
      role="button"
      aria-label={label ?? ''}
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ hovered }) => ({
        ...row,
        backgroundColor: hovered ? theme.colour.raised : undefined,
      })}
    >
      {children}
    </Tappable>
  );
}

/** A cell of a row or of the headings; `numeric` ones line up at the end */
export function Cell({
  children,
  numeric,
  style,
}: {
  children?: React.ReactNode;
  numeric?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: numeric ? 'flex-end' : 'flex-start',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** The text of a cell: compact, or the muted caption beside it */
export function CellText({
  children,
  muted,
  bold,
  testID,
}: {
  children?: React.ReactNode;
  muted?: boolean;
  bold?: boolean;
  testID?: string;
}) {
  return (
    <Text
      variant={bold ? 'label' : muted ? 'caption' : 'bodyCompact'}
      tone={muted ? 'muted' : 'default'}
      testID={testID}
    >
      {children}
    </Text>
  );
}
