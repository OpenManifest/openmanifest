import * as React from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import IconButton from '../IconButton';
import Text from '../Text';
import Field, { fieldAria, useFieldIds, type FieldMessages } from './Field';
import { useBoxStyle } from './TextField';
import { withHookForm } from './withHookForm';

export type NumberFieldProps = FieldMessages & {
  label: string;
  /** `null` is an empty field */
  value?: number | null;
  onChange?(value: number | null): void;
  onBlur?(): void;
  min?: number;
  max?: number;
  /** What the buttons and the arrow keys add or take away (default 1) */
  step?: number;
  /** A unit after the number: "kg", "ft" */
  unit?: string;
  /** A symbol before it: "$" */
  prefix?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Without the minus and plus buttons */
  hideSteppers?: boolean;
  testID?: string;
};

const clamp = (n: number, min?: number, max?: number) =>
  Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, n));

// 0.1 + 0.2 is not 0.3: round what stepping by fractions produces
const round = (n: number) => Math.round(n * 1e6) / 1e6;

/** The number in `text` (a comma is a decimal point), or null when it is empty or not a number */
export function parseNumber(text: string): number | null {
  const trimmed = text.trim().replace(',', '.');
  if (trimmed === '') return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

/**
 * A number input with a unit, a minimum and maximum, and a step. The buttons and the up and down keys step it; typing
 * is free, and the value is brought within the limits when the field loses focus. It is announced as a spin button with
 * its value and limits.
 */
function NumberField({
  label,
  value,
  onChange,
  onBlur,
  min,
  max,
  step = 1,
  unit,
  prefix,
  placeholder,
  disabled = false,
  hideSteppers = false,
  helperText,
  error,
  testID,
}: NumberFieldProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const ids = useFieldIds();
  const [focused, setFocused] = React.useState(false);
  const [text, setText] = React.useState(value == null ? '' : String(value));
  const box = useBoxStyle({ focused, error: !!error, disabled });

  // Follow the value when it changes from outside (the buttons, a form reset), but not while the text already means it
  const [seen, setSeen] = React.useState(value);
  if (value !== seen) {
    setSeen(value);
    if (parseNumber(text) !== (value ?? null)) setText(value == null ? '' : String(value));
  }

  const commit = (next: number | null) => {
    setText(next == null ? '' : String(next));
    onChange?.(next);
  };
  const stepBy = (direction: 1 | -1) => {
    const current = parseNumber(text) ?? value ?? min ?? 0;
    commit(round(clamp(current + direction * step, min, max)));
  };

  return (
    <Field label={label} ids={ids} helperText={helperText} error={error}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space.sm }}>
        <View style={[box, { flexGrow: 1, flexShrink: 1 }]}>
          {prefix ? (
            <Text variant="bodyCompact" tone="muted">
              {prefix}
            </Text>
          ) : null}
          <TextInput
            {...fieldAria(ids, { helperText, error, label })}
            testID={testID}
            role="spinbutton"
            aria-label={label}
            accessibilityValue={{ min, max, now: value ?? undefined }}
            value={text}
            inputMode="decimal"
            keyboardType="decimal-pad"
            placeholder={placeholder}
            placeholderTextColor={theme.colour.textMuted}
            editable={!disabled}
            onChangeText={(next) => {
              setText(next);
              const parsed = parseNumber(next);
              if (parsed != null || next.trim() === '') onChange?.(parsed);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              const parsed = parseNumber(text);
              if (parsed != null) commit(round(clamp(parsed, min, max)));
              onBlur?.();
            }}
            onKeyPress={(event) => {
              const key = event.nativeEvent.key;
              if (key === 'ArrowUp') stepBy(1);
              else if (key === 'ArrowDown') stepBy(-1);
            }}
            style={{
              ...theme.type.body,
              flexGrow: 1,
              flexShrink: 1,
              color: disabled ? theme.colour.textMuted : theme.colour.text,
              paddingVertical: theme.space.sm,
            }}
          />
          {unit ? (
            <Text variant="bodyCompact" tone="muted">
              {unit}
            </Text>
          ) : null}
        </View>
        {hideSteppers ? null : (
          <>
            <IconButton
              icon="minus"
              aria-label={t('form.decrease', { label })}
              disabled={disabled || (min != null && (parseNumber(text) ?? value ?? min) <= min)}
              onPress={() => stepBy(-1)}
            />
            <IconButton
              icon="plus"
              aria-label={t('form.increase', { label })}
              disabled={
                disabled || (max != null && (parseNumber(text) ?? value ?? min ?? 0) >= max)
              }
              onPress={() => stepBy(1)}
            />
          </>
        )}
      </View>
    </Field>
  );
}

export default NumberField;
export const FormNumberField = withHookForm(NumberField);
