import * as React from 'react';
import {
  Platform,
  Pressable as NativePressable,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import { useTheme } from './theme';

export type TappableProps = Omit<
  PressableProps,
  'style' | 'children' | 'role' | 'accessibilityLabel'
> & {
  /** What the control is and what it is called: every pressable has both (design plan §3.5) */
  role: 'button' | 'link' | 'tab' | 'menuitem' | 'switch' | 'checkbox' | 'radio';
  'aria-label': string;
  style?:
    ViewStyle | ((state: { pressed: boolean; hovered: boolean; focused: boolean }) => ViewStyle);
  /** Grows to the smallest touch target of the platform (default) */
  minTarget?: boolean;
  children?: React.ReactNode;
};

type WebState = { pressed: boolean; hovered?: boolean; focused?: boolean };

/**
 * The one tappable of the app: a role and a name are required, it is at least as big as the platform's smallest touch
 * target, it shows a focus ring from the tokens on keyboard focus and keeps hover and pressed states for the caller to
 * style. `onPress` and the rest are passed through.
 */
export default function Tappable({ style, minTarget = true, children, ...rest }: TappableProps) {
  const theme = useTheme();
  const target = minTarget ? theme.density.touchTarget : undefined;

  return (
    <NativePressable
      {...rest}
      style={(state) => {
        const { pressed, hovered = false, focused = false } = state as WebState;
        const given = typeof style === 'function' ? style({ pressed, hovered, focused }) : style;
        const ring: ViewStyle =
          Platform.OS === 'web' && focused
            ? ({
                outlineStyle: 'solid',
                outlineWidth: 2,
                outlineColor: theme.colour.brandText,
                outlineOffset: -2,
              } as ViewStyle)
            : {};
        return { minHeight: target, minWidth: target, ...given, ...ring };
      }}
    >
      {children}
    </NativePressable>
  );
}
