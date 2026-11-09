import * as React from 'react';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { formatTime } from 'app/i18n/format';
import Button from '../Button';
import type { FieldMessages } from './Field';
import PickerBox from './PickerBox';
import { deviceDateShowing, secondsOfClock } from './dateTime';
import { withHookForm } from './withHookForm';

export type TimeFieldProps = FieldMessages & {
  /** The name of the field: shown above it and read by screen readers */
  label: string;
  /** Seconds since the epoch; empty when absent or 0 */
  value?: number | null;
  /** The chosen time of day, today on the operator's clock, as seconds since the epoch */
  onChange?(seconds: number): void;
  onBlur?(): void;
  /** The zone of the clock: the operator's (default: this device's) */
  timeZone?: string | null;
  disabled?: boolean;
  testID?: string;
};

/**
 * A time of day on the operator's clock: a box that says the time and opens the platform's picker (Android's clock
 * dialog, iOS's wheels under the box with a Done button). The web has `TimeField.web.tsx`, the browser's time input.
 */
function TimeField({
  label,
  value,
  onChange,
  onBlur,
  timeZone,
  disabled,
  helperText,
  error,
  testID,
}: TimeFieldProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = React.useState(false);
  const current = deviceDateShowing(value, timeZone);

  // The native pickers read the device's clock; the hours and minutes on it are the operator's
  const choose = (date: Date) => {
    const seconds = secondsOfClock(
      `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`,
      timeZone
    );
    if (seconds !== null) onChange?.(seconds);
  };

  const onPress = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'time',
        is24Hour: true,
        onChange: (event: DateTimePickerEvent, date?: Date) => {
          onBlur?.();
          if (event.type === 'set' && date) choose(date);
        },
      });
    } else {
      setOpen((wasOpen) => !wasOpen);
    }
  };

  return (
    <PickerBox
      label={label}
      text={value ? formatTime(value, timeZone) : null}
      empty={t('form.noTime')}
      icon="clock-outline"
      disabled={disabled}
      open={open}
      onPress={onPress}
      helperText={helperText}
      error={error}
      testID={testID}
    >
      {open && Platform.OS === 'ios' ? (
        <>
          <DateTimePicker
            value={current}
            mode="time"
            display="spinner"
            onChange={(event, date) => (event.type === 'set' && date ? choose(date) : undefined)}
          />
          <Button
            variant="tertiary"
            label={t('form.done')}
            onPress={() => {
              setOpen(false);
              onBlur?.();
            }}
          />
        </>
      ) : null}
    </PickerBox>
  );
}

export default TimeField;
export const FormTimeField = withHookForm(TimeField);
