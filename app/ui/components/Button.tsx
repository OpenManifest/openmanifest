import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Tappable, { type TappableProps } from '../Tappable';
import { useTheme } from '../theme';
import Text, { type TextTone } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';

export type ButtonProps = Omit<TappableProps, 'role' | 'aria-label' | 'children' | 'style'> & {
  /** What the button says; it is also its accessible name unless `aria-label` says more */
  label: string;
  'aria-label'?: string;
  variant?: ButtonVariant;
  /** A leading icon (a MaterialCommunityIcons name) */
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  /** Shows a spinner in place of the icon, keeps the label and ignores presses */
  loading?: boolean;
  disabled?: boolean;
  /** Fills the width of its parent */
  fullWidth?: boolean;
};

/** Background, border and text of a variant, from the semantic tokens */
function useVariant(variant: ButtonVariant): {
  bg: string;
  fg: string;
  border: string;
  tone: TextTone;
} {
  const { colour } = useTheme();
  switch (variant) {
    case 'secondary':
      return {
        bg: colour.brandSoft,
        fg: colour.onBrandSoft,
        border: 'transparent',
        tone: 'onBrandSoft',
      };
    case 'tertiary':
      return { bg: 'transparent', fg: colour.brandText, border: 'transparent', tone: 'brand' };
    case 'destructive':
      return {
        bg: colour.status.blocked.bg,
        fg: colour.status.blocked.fg,
        border: colour.status.blocked.fg,
        tone: 'blocked',
      };
    default:
      return { bg: colour.brand, fg: colour.onBrand, border: 'transparent', tone: 'onBrand' };
  }
}

const ICON_SIZE = 20;

/**
 * The button of the app: primary, secondary, tertiary or destructive. Its height follows the density (never below the
 * platform's touch target), it shows pressed, hover (web) and focus-visible states, and while `loading` it announces
 * itself as busy and ignores presses.
 */
export default function Button({
  label,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const { bg, fg, border, tone } = useVariant(variant);
  const inactive = disabled || loading;
  const height = Math.max(theme.density.touchTarget, theme.density.row);

  return (
    <Tappable
      {...rest}
      role="button"
      aria-label={rest['aria-label'] ?? label}
      aria-disabled={inactive}
      aria-busy={loading}
      disabled={inactive}
      onPress={onPress}
      minTarget={false}
      style={({ pressed, hovered }) => ({
        minHeight: height,
        minWidth: theme.density.touchTarget,
        alignSelf: fullWidth ? 'stretch' : 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.space.lg,
        borderRadius: theme.radius.md,
        borderWidth: variant === 'destructive' ? 1 : 0,
        borderColor: border,
        backgroundColor: bg,
        opacity: disabled ? 0.4 : pressed ? 0.75 : hovered ? 0.9 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
        {loading ? (
          <ActivityIndicator size="small" color={fg} testID="button-spinner" />
        ) : icon ? (
          <MaterialCommunityIcons name={icon} size={ICON_SIZE} color={fg} />
        ) : null}
        <Text variant="label" tone={tone} chrome numberOfLines={1}>
          {label}
        </Text>
      </View>
    </Tappable>
  );
}
