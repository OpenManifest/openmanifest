import * as React from 'react';
import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';
import { useTheme } from '../theme';
import type { StatusKey, TypeKey } from '../tokens';

/** A semantic colour: text on the surface, quieter text, brand text, text on a brand fill, or a status foreground */
export type TextTone = 'default' | 'muted' | 'brand' | 'onBrand' | 'onBrandSoft' | StatusKey;

export type TextProps = Omit<NativeTextProps, 'style'> & {
  /** A type token (default `body`) */
  variant?: TypeKey;
  tone?: TextTone;
  /** Digits of equal width so columns line up and countdowns do not jitter (the default; `false` for running prose) */
  tabular?: boolean;
  /** Text in bars and chips stays readable at the largest font sizes instead of growing without limit */
  chrome?: boolean;
  align?: 'left' | 'center' | 'right';
};

const STATUS: StatusKey[] = [
  'open',
  'boarding',
  'departed',
  'landed',
  'cancelled',
  'warning',
  'blocked',
  'ok',
  'info',
];

/** The colour of a tone in the current theme */
export function useTone(tone: TextTone = 'default'): string {
  const { colour } = useTheme();
  if ((STATUS as string[]).includes(tone)) return colour.status[tone as StatusKey].fg;
  switch (tone) {
    case 'muted':
      return colour.textMuted;
    case 'brand':
      return colour.brandText;
    case 'onBrand':
      return colour.onBrand;
    case 'onBrandSoft':
      return colour.onBrandSoft;
    default:
      return colour.text;
  }
}

/** The one text of the app: a type token for size, weight and line height, a semantic tone for colour. */
export default function Text({
  variant = 'body',
  tone = 'default',
  tabular = true,
  chrome = false,
  align,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const { fontVariant, ...scale } = theme.type[variant];
  const color = useTone(tone);

  return (
    <NativeText
      maxFontSizeMultiplier={chrome ? CHROME_MAX_FONT_SIZE_MULTIPLIER : undefined}
      {...rest}
      style={{ ...scale, ...(tabular ? { fontVariant } : {}), color, textAlign: align }}
    />
  );
}
