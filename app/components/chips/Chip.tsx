import * as React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, Tappable, Text, useTheme, type IconName } from 'app/ui';

export type ChipProps = {
  /** The words on the chip; also its name unless `aria-label` says more */
  children?: React.ReactNode;
  icon?: IconName;
  onPress?(): void;
  disabled?: boolean;
  small?: boolean;
  /** `flat` has no border (default `outlined`) */
  mode?: 'flat' | 'outlined';
  /** The border and text colour (default: the text colour of the theme) */
  color?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  'aria-label'?: string;
  testID?: string;
};

/**
 * The value chip of the classic board and the older selects: an icon and a short label in an outlined pill, pressable
 * when it opens a menu. New screens use `Chip` from `app/ui`.
 */
export default function Chip(props: ChipProps) {
  const {
    children,
    icon,
    onPress,
    disabled = false,
    small,
    mode = 'outlined',
    color,
    backgroundColor,
    style,
    testID,
  } = props;
  const theme = useTheme();
  const tint = color || theme.colour.text;
  const label =
    typeof children === 'string' || typeof children === 'number' ? String(children) : '';

  const shape: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: theme.space.xs,
    marginHorizontal: theme.space.xs,
    paddingHorizontal: small ? theme.space.sm : theme.space.md,
    paddingVertical: small ? 0 : theme.space.xs,
    borderRadius: theme.radius.pill,
    borderWidth: mode === 'flat' ? 0 : 1,
    borderColor: tint,
    backgroundColor: mode === 'flat' ? theme.colour.raised : backgroundColor,
    opacity: disabled ? 0.6 : 1,
  };

  const content = (
    <>
      {icon ? <Icon name={icon} size={small ? 14 : 18} tone="muted" /> : null}
      <Text variant={small ? 'caption' : 'label'} numberOfLines={1}>
        {children}
      </Text>
    </>
  );

  if (!onPress) {
    return (
      <View testID={testID} style={[shape, style]}>
        {content}
      </View>
    );
  }

  return (
    <View style={style}>
      <Tappable
        role="button"
        aria-label={props['aria-label'] || label}
        minTarget={false}
        disabled={disabled}
        onPress={onPress}
        testID={testID}
        style={{ ...shape, marginHorizontal: 0 }}
      >
        {content}
      </Tappable>
    </View>
  );
}
