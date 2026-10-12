import * as React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Tappable, { type TappableProps } from '../Tappable';
import { useTheme } from '../theme';
import { useTone, type TextTone } from './Text';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type IconButtonProps = Omit<TappableProps, 'role' | 'children' | 'style'> & {
  /** What it does: an icon alone says nothing to a screen reader, so the type requires a name */
  'aria-label': string;
  icon: IconName;
  /** Size of the icon in dp (default 24) */
  size?: number;
  tone?: TextTone;
  /** For toolbars with little room: the box hugs the icon and the touch target extends past it (`hitSlop`) */
  dense?: boolean;
  disabled?: boolean;
};

const PADDING = 4;

/**
 * An icon that is a button. The touch target is the platform's minimum (44 or 48 dp): either the box itself, or, when
 * `dense`, the hit area around a smaller box.
 */
export default function IconButton({
  icon,
  size = 24,
  tone = 'default',
  dense = false,
  disabled = false,
  ...rest
}: IconButtonProps) {
  const theme = useTheme();
  const colour = useTone(tone);
  const box = size + 2 * PADDING;
  const slop = Math.max(0, Math.ceil((theme.density.touchTarget - box) / 2));

  return (
    <Tappable
      {...rest}
      role="button"
      aria-disabled={disabled}
      disabled={disabled}
      minTarget={!dense}
      hitSlop={dense ? slop : undefined}
      style={({ pressed, hovered }) => ({
        alignItems: 'center',
        justifyContent: 'center',
        ...(dense ? { width: box, height: box } : {}),
        borderRadius: theme.radius.pill,
        backgroundColor: pressed || hovered ? theme.colour.raised : 'transparent',
        opacity: disabled ? 0.4 : 1,
      })}
    >
      <MaterialCommunityIcons name={icon} size={size} color={colour} />
    </Tappable>
  );
}
