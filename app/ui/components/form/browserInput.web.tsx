import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import Field, { fieldAria, useFieldIds, type FieldMessages } from './Field';
import { useBoxStyle } from './TextField';

type BrowserInputProps = FieldMessages & {
  type: 'date' | 'time';
  label: string;
  /** The input's own value: yyyy-MM-dd or HH:mm, '' for none */
  value: string;
  onChange(value: string): void;
  onBlur?(): void;
  disabled?: boolean;
  testID?: string;
};

/**
 * The browser's own date or time input in the box of a text field: the browser gives it the calendar or the clock, the
 * keyboard entry and what screen readers say, in the language of the browser.
 */
export default function BrowserInput({
  type,
  label,
  value,
  onChange,
  onBlur,
  disabled = false,
  helperText,
  error,
  testID,
}: BrowserInputProps) {
  const theme = useTheme();
  const ids = useFieldIds();
  const [focused, setFocused] = React.useState(false);
  const box = useBoxStyle({ focused, error: !!error, disabled });

  return (
    <Field label={label} ids={ids} helperText={helperText} error={error}>
      <View style={box}>
        {React.createElement('input', {
          ...fieldAria(ids, { helperText, error, label }),
          type,
          value,
          disabled,
          'aria-label': label,
          'data-testid': testID,
          onChange: (event: { target: { value: string } }) => onChange(event.target.value),
          onFocus: () => setFocused(true),
          onBlur: () => {
            setFocused(false);
            onBlur?.();
          },
          style: {
            ...theme.type.body,
            fontSize: `${theme.type.body.fontSize}px`,
            lineHeight: `${theme.type.body.lineHeight}px`,
            fontFamily: 'inherit',
            flexGrow: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: disabled ? theme.colour.textMuted : theme.colour.text,
            // The calendar and clock icons and popups of the browser follow the scheme
            colorScheme: theme.isDark ? 'dark' : 'light',
            paddingTop: theme.space.sm,
            paddingBottom: theme.space.sm,
            paddingLeft: 0,
            paddingRight: 0,
          },
        })}
      </View>
    </Field>
  );
}
