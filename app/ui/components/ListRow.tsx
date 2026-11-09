import * as React from 'react';
import { View } from 'react-native';
import Tappable from '../Tappable';
import { useTheme } from '../theme';
import Text from './Text';

export type ListRowProps = {
  title: string;
  /** A second line under the title */
  supporting?: string;
  /** What comes before the text: an icon, an avatar */
  leading?: React.ReactNode;
  /** What comes after it: a value, a chevron, a switch */
  trailing?: React.ReactNode;
  /** Makes the row a button */
  onPress?: () => void;
  /** The row is the current one of a list (marked with the brand colour and `aria-current`) */
  selected?: boolean;
  disabled?: boolean;
  /** The accessible name of a pressable row when it should say more than the title */
  'aria-label'?: string;
  testID?: string;
};

/**
 * A row of a list: leading, title, supporting text, trailing. With `onPress` it is a button (named by the title, or
 * `aria-label`) at least as tall as the density says; without, it is plain content.
 */
export default function ListRow({
  title,
  supporting,
  leading,
  trailing,
  onPress,
  selected = false,
  disabled = false,
  testID,
  ...rest
}: ListRowProps) {
  const theme = useTheme();
  const content = (
    <>
      {leading ? <View>{leading}</View> : null}
      <View style={{ flexGrow: 1, flexShrink: 1 }}>
        <Text variant="body" tone={selected ? 'onBrandSoft' : 'default'} numberOfLines={1}>
          {title}
        </Text>
        {supporting ? (
          <Text variant="caption" tone={selected ? 'onBrandSoft' : 'muted'} numberOfLines={2}>
            {supporting}
          </Text>
        ) : null}
      </View>
      {trailing ? <View>{trailing}</View> : null}
    </>
  );
  const row = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.md,
    minHeight: theme.density.row,
    paddingVertical: theme.space.sm,
    paddingHorizontal: theme.space.lg,
  } as const;

  if (!onPress) {
    return (
      <View
        testID={testID}
        aria-current={selected ? true : undefined}
        style={{ ...row, backgroundColor: selected ? theme.colour.brandSoft : 'transparent' }}
      >
        {content}
      </View>
    );
  }

  return (
    <Tappable
      role="button"
      aria-label={rest['aria-label'] ?? title}
      aria-current={selected ? true : undefined}
      aria-disabled={disabled}
      disabled={disabled}
      testID={testID}
      onPress={onPress}
      minTarget={false}
      style={({ pressed, hovered }) => ({
        ...row,
        backgroundColor: selected
          ? theme.colour.brandSoft
          : pressed || hovered
            ? theme.colour.raised
            : 'transparent',
        opacity: disabled ? 0.4 : 1,
      })}
    >
      {content}
    </Tappable>
  );
}
