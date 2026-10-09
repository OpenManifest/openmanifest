import * as React from 'react';
import { List, Modal } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import { DateTime } from 'luxon';
import { clockInZone, resolveTimeZone, timeTodayInZone } from 'app/utils/dropzoneTime';

interface ITimePickerProps {
  label?: string;
  timestamp?: number;
  disabled?: boolean;
  color?: string;
  /** The zone the time of day is in: the dropzone's (default: this device's) */
  timeZone?: string;
  onChange(timestamp: number): void;
}
export default function TimePicker(props: ITimePickerProps) {
  const { disabled, label, timestamp, onChange, color, timeZone } = props;
  const zone = resolveTimeZone(timeZone);
  const [open, setOpen] = React.useState(false);

  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = React.useCallback(
    (hour: number, minute: number) => {
      setOpen(false);
      onChange(timeTodayInZone(hour, minute, zone));
    },
    [setOpen, onChange, zone]
  );

  const timestampLabel = timestamp ? clockInZone(timestamp, zone) : 'No time selected';
  const shown = DateTime.fromSeconds(timestamp || DateTime.local().toSeconds(), { zone });

  return (
    <>
      <List.Item
        title={label || timestampLabel}
        disabled={!!disabled}
        description={!label ? null : timestampLabel}
        left={() => <List.Icon color={color} icon="calendar" />}
        onPress={() => setOpen(true)}
      />

      <Modal visible={open}>
        <TimePickerModal
          hours={shown.hour}
          minutes={shown.minute}
          locale="en"
          visible={open}
          onDismiss={onDismissSingle}
          onConfirm={(time) => onConfirm(time.hours, time.minutes)}
          label={label}
        />
      </Modal>
    </>
  );
}
