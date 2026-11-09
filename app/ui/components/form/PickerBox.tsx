import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import Tappable from '../../Tappable';
import Icon, { type IconName } from '../Icon';
import Text from '../Text';
import Field, { useFieldIds, type FieldMessages } from './Field';
import { useBoxStyle } from './TextField';

type PickerBoxProps = FieldMessages & {
  label: string;
  /** What the field holds, in words; `null` shows `empty` */
  text: string | null;
  empty: string;
  icon: IconName;
  disabled?: boolean;
  open: boolean;
  onPress(): void;
  testID?: string;
  /** The native picker, shown under the box while it is open (iOS) */
  children?: React.ReactNode;
};

/**
 * The box of a date or time field on native: it looks like a text field, says the value (or that there is none) and
 * opens the platform's picker when pressed. Screen readers hear the label and the value as one button.
 */
export default function PickerBox({
  label,
  text,
  empty,
  icon,
  disabled = false,
  open,
  onPress,
  helperText,
  error,
  testID,
  children,
}: PickerBoxProps) {
  const theme = useTheme();
  const ids = useFieldIds();
  const box = useBoxStyle({ focused: open, error: !!error, disabled });

  return (
    <Field label={label} ids={ids} helperText={helperText} error={error}>
      <Tappable
        role="button"
        aria-label={`${label}: ${text ?? empty}`}
        aria-expanded={open}
        disabled={disabled}
        onPress={onPress}
        testID={testID}
        style={box}
      >
        <Icon name={icon} tone="muted" />
        <View style={{ flexGrow: 1, flexShrink: 1, paddingVertical: theme.space.sm }}>
          <Text variant="body" tone={text && !disabled ? 'default' : 'muted'}>
            {text ?? empty}
          </Text>
        </View>
      </Tappable>
      {children}
    </Field>
  );
}
