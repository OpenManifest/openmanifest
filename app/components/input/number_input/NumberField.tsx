import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, IconButton, List, TextInput } from 'react-native-paper';

export enum NumberFieldType {
  Cash = 'cash',
  Weight = 'weight',
  CanopySize = 'canopySize',
}
interface INumberFieldProps {
  error?: string | null;
  label?: string;
  helperText?: string;
  disabled?: boolean;
  value?: number | null;
  mode?: 'outlined' | 'flat';
  variant?: NumberFieldType | null;
  step?: number;
  min?: number;
  max?: number;
  onChange(newValue: number): void;
}

const clamp = (n: number, min?: number, max?: number) =>
  Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, n));

// Avoid 0.1 + 0.2 style noise when stepping by fractions
const round = (n: number) => Math.round(n * 1000) / 1000;

export default function NumberField(props: INumberFieldProps) {
  const { onChange, label, mode, disabled, variant, step = 0.5, min, max, ...rest } = props;
  const { value, helperText, error } = rest;

  const current = value || 0;
  const [text, setText] = React.useState(String(current));

  // Follow the value when it changes from outside (the buttons, a form reset)
  React.useEffect(() => {
    setText((previous) => (Number(previous) === current ? previous : String(current)));
  }, [current]);

  const update = (next: number) => {
    const clamped = round(clamp(next, min, max));
    setText(String(clamped));
    onChange(clamped);
  };

  const unit = variant === NumberFieldType.Weight ? 'kg' : variant === NumberFieldType.CanopySize ? 'ft' : undefined;
  return (
    <>
      {label && <List.Subheader>{label}</List.Subheader>}
      <View style={styles.row}>
        <IconButton
          icon="minus"
          accessibilityLabel="Decrease"
          disabled={disabled || (min !== undefined && current <= min)}
          onPress={() => update(current - step)}
        />
        <TextInput
          dense
          mode={mode || 'outlined'}
          style={styles.input}
          keyboardType="decimal-pad"
          inputMode="decimal"
          disabled={disabled}
          error={!!error}
          value={text}
          left={variant === NumberFieldType.Cash ? <TextInput.Affix text="$" /> : undefined}
          right={unit ? <TextInput.Affix text={unit} /> : undefined}
          onChangeText={(newText) => {
            setText(newText);
            const parsed = Number(newText.replace(',', '.'));
            if (newText.trim() !== '' && Number.isFinite(parsed)) {
              onChange(round(clamp(parsed, min, max)));
            }
          }}
          onBlur={() => update(Number.isFinite(Number(text.replace(',', '.'))) ? Number(text.replace(',', '.')) : current)}
        />
        <IconButton
          icon="plus"
          accessibilityLabel="Increase"
          disabled={disabled || (max !== undefined && current >= max)}
          onPress={() => update(current + step)}
        />
      </View>
      {helperText || error ? (
        <HelperText style={styles.helperText} type={error ? 'error' : 'info'}>
          {error || helperText}
        </HelperText>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    textAlign: 'center',
  },
  helperText: {
    marginBottom: 16,
  },
});
