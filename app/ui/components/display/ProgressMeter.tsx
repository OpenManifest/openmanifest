import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import type { StatusKey } from '../../tokens';
import Text from '../Text';

export type ProgressMeterProps = {
  /** What is measured ("Slots filled"): the name a screen reader gives the bar */
  label: string;
  value: number;
  /** The most it can be (default 1, so `value` is a fraction) */
  max?: number;
  /** The words shown beside the bar, and read out ("3 of 10"); the percentage when absent */
  valueText?: string;
  /** Show the words (default); `false` for a bar that sits in a row with its own text */
  showValue?: boolean;
  /** The colour of the fill: the brand, or a status when it matters (a load that is full) */
  tone?: 'brand' | StatusKey;
  testID?: string;
};

const HEIGHT = 8;

/** A bar that fills from the start with `value` of `max`: a progress bar with its value, limits and text for readers */
export default function ProgressMeter({
  label,
  value,
  max = 1,
  valueText,
  showValue = true,
  tone = 'brand',
  testID,
}: ProgressMeterProps) {
  const theme = useTheme();
  const clamped = Math.min(max, Math.max(0, value));
  const fraction = max > 0 ? clamped / max : 0;
  const text = valueText ?? `${Math.round(fraction * 100)}%`;
  const fill = tone === 'brand' ? theme.colour.brand : theme.colour.status[tone].fg;

  return (
    <View
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-valuetext={text}
      accessible
      accessibilityValue={{ min: 0, max, now: clamped, text }}
      testID={testID}
      style={{ gap: theme.space.xs }}
    >
      <View
        style={{
          height: HEIGHT,
          borderRadius: theme.radius.pill,
          overflow: 'hidden',
          backgroundColor: theme.colour.raised,
        }}
      >
        <View
          testID={testID ? `${testID}-fill` : undefined}
          style={{
            width: `${fraction * 100}%`,
            height: HEIGHT,
            borderRadius: theme.radius.pill,
            backgroundColor: fill,
          }}
        />
      </View>
      {showValue ? (
        <Text variant="caption" tone="muted" aria-hidden>
          {text}
        </Text>
      ) : null}
    </View>
  );
}
