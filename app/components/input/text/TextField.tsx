import * as React from 'react';
import { StyleSheet } from 'react-native';
import { HelperText, TextInput, useTheme } from 'react-native-paper';
import { withHookForm } from '../withHookForm';
import useSheetInputRender from '../useSheetInputRender';

type Extract<T> = T extends React.ComponentType<infer U> ? U : never;
interface ITextFieldProps extends Omit<
  Extract<typeof TextInput>,
  'onChange' | 'onChangeText' | 'error'
> {
  error?: string | null;
  helperText?: string | null;
  onChangeText?(newValue: string): void;
  onChange?(newValue: string): void;
}

function TextField(props: ITextFieldProps) {
  const { error, helperText, onChangeText: setText, onChange, style, ...rest } = props;
  const onChangeText = onChange || setText;
  const theme = useTheme();
  const render = useSheetInputRender();
  return (
    <>
      <TextInput
        mode="outlined"
        style={StyleSheet.flatten([styles.field, { backgroundColor: theme.colors.surface }, style])}
        render={render}
        {...rest}
        {...{ onChangeText }}
        error={!!error}
      />
      <HelperText style={styles.helperText} type={error ? 'error' : 'info'}>
        {error || helperText || ' '}
      </HelperText>
    </>
  );
}

export const FormTextField = withHookForm(TextField);

export default TextField;

const styles = StyleSheet.create({
  fields: {
    flex: 1,
  },
  field: {
    marginBottom: 8,
  },
  helperText: {
    marginBottom: 16,
  },
});
