import * as React from 'react';
import { StyleSheet } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

type Extract<T> = T extends React.ComponentType<infer U> ? U : never;
interface ITextFieldProps
  extends Omit<Extract<typeof TextInput>, 'onChange' | 'onChangeText' | 'error'> {
  error?: string | null;
  helperText?: string | null;
  onChangeText?(newValue: string): void;
  onChange?(newValue: string): void;
}
export default function TextField(props: ITextFieldProps) {
  const { error, helperText, onChangeText, onChange, style, ...rest } = props;
  return (
    <>
      <TextInput
        mode="outlined"
        style={StyleSheet.flatten([styles.field, style])}
        {...rest}
        error={!!error}
      />
      <HelperText type={error ? 'error' : 'info'}>{error || helperText || ''}</HelperText>
    </>
  );
}

const styles = StyleSheet.create({
  fields: {
    flex: 1,
  },
  field: {
    marginBottom: 8,
  },
});
