import * as React from 'react';
import { Text } from 'react-native';
import InputSpinner from 'react-native-input-spinner';
import { HelperText, List } from 'react-native-paper';

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
  onChange(newValue: number): void;
}
export default function NumberField(props: INumberFieldProps) {
  const { onChange, label, mode, disabled, variant, ...rest } = props;
  const { value, helperText, error } = rest;

  return (
    <>
      {label && <List.Subheader>{label}</List.Subheader>}
      <InputSpinner
        step={0.5}
        {...{ value: value || 0, onChange }}
        skin="clean"
        {...([NumberFieldType.Weight, NumberFieldType.CanopySize].includes(
          variant as NumberFieldType
        )
          ? { append: <Text>{variant === NumberFieldType.Weight ? 'kg' : 'ft'}</Text> }
          : {})}
        {...([NumberFieldType.Cash].includes(variant as NumberFieldType)
          ? { prepend: <Text>$</Text> }
          : {})}
        showBorder
        style={{
          shadowRadius: 0,
          shadowOpacity: 0,
        }}
      />
      {helperText || error ? (
        <HelperText type={error ? 'error' : 'info'}>{error || helperText}</HelperText>
      ) : null}
    </>
  );
}
