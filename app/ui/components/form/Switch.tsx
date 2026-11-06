import * as React from 'react';
import { View } from 'react-native';
import Tappable from '../../Tappable';
import { useTheme } from '../../theme';
import Text from '../Text';
import { withHookForm } from './withHookForm';
import { useFieldIds, type FieldMessages } from './Field';

const TRACK_WIDTH = 44;
const TRACK_HEIGHT = 26;
const THUMB_INSET = 3;

export type SwitchProps = FieldMessages & {
  label: string;
  value?: boolean | null;
  onChange?(value: boolean): void;
  onBlur?(): void;
  disabled?: boolean;
  testID?: string;
};

/**
 * A labelled on/off setting. The whole row is the control (a switch named by the label, `aria-checked`), at least as
 * tall as the density says.
 */
function Switch({
  label,
  value,
  onChange,
  onBlur,
  disabled = false,
  helperText,
  error,
  testID,
}: SwitchProps) {
  const theme = useTheme();
  const { messageId } = useFieldIds();
  const on = !!value;
  const message = error || helperText;

  return (
    <View>
      <Tappable
        role="switch"
        aria-label={label}
        aria-checked={on}
        aria-describedby={message ? messageId : undefined}
        aria-invalid={!!error}
        aria-disabled={disabled}
        disabled={disabled}
        testID={testID}
        minTarget={false}
        onBlur={onBlur}
        onPress={() => onChange?.(!on)}
        style={({ pressed, hovered }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: theme.space.md,
          minHeight: theme.density.row,
          paddingVertical: theme.space.sm,
          backgroundColor: pressed || hovered ? theme.colour.raised : 'transparent',
          opacity: disabled ? 0.5 : 1,
        })}
      >
        <View style={{ flexShrink: 1 }}>
          <Text>{label}</Text>
        </View>
        {/* The row is the control: the track and thumb are only its picture (no native input inside a control) */}
        <View
          aria-hidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: TRACK_WIDTH,
            height: TRACK_HEIGHT,
            borderRadius: theme.radius.pill,
            padding: THUMB_INSET,
            justifyContent: 'center',
            alignItems: on ? 'flex-end' : 'flex-start',
            backgroundColor: on ? theme.colour.brand : theme.colour.textMuted,
          }}
        >
          <View
            style={{
              width: TRACK_HEIGHT - 2 * THUMB_INSET,
              height: TRACK_HEIGHT - 2 * THUMB_INSET,
              borderRadius: theme.radius.pill,
              backgroundColor: on ? theme.colour.onBrand : theme.colour.surface,
            }}
          />
        </View>
      </Tappable>
      {message ? (
        <Text
          variant="caption"
          tone={error ? 'blocked' : 'muted'}
          nativeID={messageId}
          role={error ? 'alert' : undefined}
          aria-live={error ? 'polite' : undefined}
          accessibilityLiveRegion={error ? 'polite' : undefined}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

export default Switch;
export const FormSwitch = withHookForm(Switch);
