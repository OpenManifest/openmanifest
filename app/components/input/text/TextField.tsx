import * as React from 'react';
import UiTextField, {
  type TextFieldProps as UiTextFieldProps,
} from 'app/ui/components/form/TextField';
import { withHookForm } from '../withHookForm';

/**
 * The props this field took when it was a Paper `TextInput`: the ones that still mean something are passed on, the
 * look (`mode`, `style`, adornments, a custom `render`) is the design system's now.
 */
export type ITextFieldProps = Omit<UiTextFieldProps, 'label' | 'onChange'> & {
  label?: string;
  onChange?(newValue: string): void;
  onChangeText?(newValue: string): void;
  /** Ignored: kept so existing call sites compile */
  mode?: 'flat' | 'outlined';
  style?: unknown;
  passwordRules?: string;
  render?: unknown;
  dense?: boolean;
  left?: unknown;
  right?: unknown;
  editable?: boolean;
  numberOfLines?: number;
  placeholderTextColor?: string;
  defaultValue?: string;
  role?: string;
  accessibilityValue?: unknown;
};

function TextField({
  label,
  onChange,
  onChangeText,
  editable,
  disabled,
  mode: _mode,
  style: _style,
  passwordRules: _passwordRules,
  render: _render,
  dense: _dense,
  left: _left,
  right: _right,
  numberOfLines: _numberOfLines,
  placeholderTextColor: _placeholderTextColor,
  defaultValue,
  role: _role,
  accessibilityValue: _accessibilityValue,
  value,
  ...rest
}: ITextFieldProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? '');
  const change = onChange ?? onChangeText;

  return (
    <UiTextField
      {...rest}
      label={label ?? ''}
      value={value ?? (defaultValue !== undefined ? uncontrolled : value)}
      disabled={disabled ?? editable === false}
      onChange={(next) => {
        setUncontrolled(next);
        change?.(next);
      }}
    />
  );
}

export const FormTextField = withHookForm(TextField);

export default TextField;
