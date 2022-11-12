import * as React from 'react';
import { StyleSheet } from 'react-native';
import { HelperText, useTheme, Switch as SwitchComponent, List } from 'react-native-paper';
import { withHookForm } from '../withHookForm';

type Extract<T> = T extends React.ComponentType<infer U> ? U : never;
interface ISwitchProps
  extends Omit<Extract<typeof SwitchComponent>, 'onChange' | 'onChangeText' | 'error'> {
  label?: string;
  error?: string | null;
  helperText?: string | null;
  onChange?(value: boolean): void;
}

function Switch(props: ISwitchProps) {
  const { error, label, helperText, onChange, style, ...rest } = props;
  const theme = useTheme();
  return (
    <>
      <List.Item
        title={label}
        right={() => (
          <SwitchComponent
            style={StyleSheet.flatten([
              styles.field,
              { backgroundColor: theme.colors.surface },
              style,
            ])}
            {...rest}
            onValueChange={onChange}
          />
        )}
      />
      <HelperText type={error ? 'error' : 'info'}>{error || helperText || ' '}</HelperText>
    </>
  );
}

export const SwitchField = withHookForm(Switch);

export default Switch;

const styles = StyleSheet.create({
  fields: {
    flex: 1,
  },
  field: {
    marginBottom: 8,
  },
});
