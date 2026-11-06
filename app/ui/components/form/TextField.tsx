import * as React from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useInSheet } from 'app/components/layout/SheetContext';
import { useTheme } from '../../theme';
import Text from '../Text';
import Field, { fieldAria, useFieldIds, type FieldMessages } from './Field';
import { withHookForm } from './withHookForm';

export type TextFieldProps = FieldMessages & {
  /** The name of the field: shown above it and read by screen readers */
  label: string;
  value?: string | null;
  onChange?(value: string): void;
  onBlur?(): void;
  placeholder?: string;
  disabled?: boolean;
  multiline?: boolean;
  /** A unit or hint inside the box, after the text */
  suffix?: string;
  /** The input itself, to focus it from a shortcut (People's "/") */
  inputRef?: React.Ref<TextInput>;
  testID?: string;
} & Pick<
    TextInputProps,
    | 'secureTextEntry'
    | 'keyboardType'
    | 'inputMode'
    | 'autoCapitalize'
    | 'autoComplete'
    | 'autoCorrect'
    | 'returnKeyType'
    | 'onSubmitEditing'
    | 'maxLength'
    | 'textContentType'
  >;

/** Colours of the box in the states of a field: the border says focused or wrong, never the colour alone */
export function useBoxStyle({
  focused,
  error,
  disabled,
  multiline = false,
}: {
  focused: boolean;
  error: boolean;
  disabled: boolean;
  multiline?: boolean;
}) {
  const theme = useTheme();
  const height = Math.max(theme.density.row, theme.density.touchTarget);

  return {
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    gap: theme.space.sm,
    minHeight: multiline ? height * 2 : height,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.md,
    borderWidth: focused || error ? 2 : 1,
    borderColor: error
      ? theme.colour.status.blocked.fg
      : focused
        ? theme.colour.brand
        : theme.colour.border,
    // A disabled field keeps readable text (muted on the raised fill): fading it would fail the contrast it is exempt from
    backgroundColor: disabled ? theme.colour.raised : theme.colour.surface,
  } as const;
}

/**
 * A text input with a label, helper text and an error. The label names the input for screen readers, the error is
 * announced when it appears, and the box is as tall as the density says. Inside a sheet it moves with the keyboard.
 */
function TextField({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  multiline = false,
  suffix,
  helperText,
  error,
  inputRef,
  testID,
  ...input
}: TextFieldProps) {
  const theme = useTheme();
  const inSheet = useInSheet();
  const ids = useFieldIds();
  const [focused, setFocused] = React.useState(false);
  const Input = (inSheet ? BottomSheetTextInput : TextInput) as typeof TextInput;
  const box = useBoxStyle({ focused, error: !!error, disabled, multiline });

  return (
    <Field label={label} ids={ids} helperText={helperText} error={error}>
      <View style={box}>
        <Input
          {...input}
          {...fieldAria(ids, { helperText, error, label })}
          ref={inputRef}
          testID={testID}
          aria-label={label || placeholder}
          value={value ?? ''}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          placeholderTextColor={theme.colour.textMuted}
          editable={!disabled}
          multiline={multiline}
          style={{
            ...theme.type.body,
            flexGrow: 1,
            flexShrink: 1,
            color: disabled ? theme.colour.textMuted : theme.colour.text,
            paddingVertical: theme.space.sm,
            ...(multiline ? { textAlignVertical: 'top' as const } : {}),
          }}
        />
        {suffix ? (
          <Text variant="bodyCompact" tone="muted">
            {suffix}
          </Text>
        ) : null}
      </View>
    </Field>
  );
}

export default TextField;
export const FormTextField = withHookForm(TextField);
