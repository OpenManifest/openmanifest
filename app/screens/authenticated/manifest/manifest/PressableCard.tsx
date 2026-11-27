import * as React from 'react';
import type { ViewStyle } from 'react-native';
import { Tappable, useTheme } from 'app/ui';

type PressableCardProps = {
  /** What a screen reader says for the card */
  label: string;
  onPress?(): void;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
  children: React.ReactNode;
};

/** A card of the classic manifest screen that opens something when pressed: the surface, radius and shadow of `Card` */
export default function PressableCard({
  label,
  onPress,
  disabled,
  style,
  testID,
  children,
}: PressableCardProps) {
  const theme = useTheme();
  return (
    <Tappable
      role="button"
      aria-label={label}
      testID={testID}
      disabled={disabled}
      onPress={onPress}
      style={({ hovered }) => ({
        backgroundColor: hovered ? theme.colour.raised : theme.colour.surface,
        borderRadius: theme.radius.lg,
        ...theme.elevation.raised,
        ...style,
      })}
    >
      {children}
    </Tappable>
  );
}
