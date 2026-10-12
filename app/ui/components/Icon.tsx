import * as React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Text, { useTone, type TextTone } from './Text';

export type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export type IconProps = {
  name: IconName;
  /** Size in dp (default 24) */
  size?: number;
  tone?: TextTone;
};

/**
 * A decorative icon in a semantic colour. It is hidden from screen readers: what it says must be in words next to it
 * (use `IconButton`, with its name, for an icon that does something).
 */
export default function Icon({ name, size = 24, tone = 'default' }: IconProps) {
  const color = useTone(tone);

  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      aria-hidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}
