import * as React from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { formatDate } from 'app/i18n/format';
import type { FieldMessages } from './Field';
import PickerBox from './PickerBox';
import { isoDateOf, secondsOfIsoDate } from './dateTime';
import { withHookForm } from './withHookForm';

export type DateFieldProps = FieldMessages & {
  /** The name of the field: shown above it and read by screen readers */
  label: string;
  /** Seconds since the epoch; empty when absent or 0 */
  value?: number | null;
  /** The chosen day, as seconds since the epoch at its midday on this device */
  onChange?(seconds: number): void;
  onBlur?(): void;
  disabled?: boolean;
  testID?: string;
};

/** The chosen day of a native picker event as the field's value (midday, so the date survives a zone change) */
function secondsOfPicked(date: Date): number | null {
  return secondsOfIsoDate(
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  );
}

/**
 * A date: a box that says the date and opens the platform's calendar (Android's dialog, iOS's inline calendar under the
 * box). The web has `DateField.web.tsx`, the browser's own date input.
 */
function DateField({
  label,
  value,
  onChange,
  onBlur,
  disabled,
  helperText,
  error,
  testID,
}: DateFieldProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = React.useState(false);
  const iso = isoDateOf(value);
  const current = iso ? new Date(`${iso}T12:00:00`) : new Date();

  const pick = (event: DateTimePickerEvent, date?: Date) => {
    setOpen(false);
    onBlur?.();
    if (event.type !== 'set' || !date) return;
    const seconds = secondsOfPicked(date);
    if (seconds !== null) onChange?.(seconds);
  };

  const onPress = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: current, mode: 'date', onChange: pick });
    } else {
      setOpen((wasOpen) => !wasOpen);
    }
  };

  return (
    <PickerBox
      label={label}
      text={iso ? formatDate(`${iso}T12:00:00`) : null}
      empty={t('form.noDate')}
      icon="calendar"
      disabled={disabled}
      open={open}
      onPress={onPress}
      helperText={helperText}
      error={error}
      testID={testID}
    >
      {open && Platform.OS === 'ios' ? (
        <DateTimePicker value={current} mode="date" display="inline" onChange={pick} />
      ) : null}
    </PickerBox>
  );
}

export default DateField;
export const FormDateField = withHookForm(DateField);
