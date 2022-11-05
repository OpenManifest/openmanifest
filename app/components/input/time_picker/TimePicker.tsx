import { format } from 'date-fns';
import * as React from 'react';
import { List, Modal } from 'react-native-paper';
import { TimePickerModal } from 'react-native-paper-dates';
import { DateTime } from 'luxon';

interface ITimePickerProps {
  label?: string;
  timestamp?: number;
  disabled?: boolean;
  color?: string;
  onChange(timestamp: number): void;
}
export default function TimePicker(props: ITimePickerProps) {
  const { disabled, label, timestamp, onChange, color } = props;
  const [open, setOpen] = React.useState(false);

  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = React.useCallback(
    ({ date }: { date: Date }) => {
      setOpen(false);
      onChange(date.getTime() / 1000);
    },
    [setOpen, onChange]
  );

  const timestampLabel = timestamp ? format(timestamp * 1000, 'hh:mm') : 'No time selected';

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
          hours={DateTime.fromSeconds(timestamp || DateTime.now().toSeconds()).hour}
          minutes={DateTime.fromSeconds(timestamp || DateTime.now().toSeconds()).minute}
          locale="en"
          visible={open}
          onDismiss={onDismissSingle}
          onConfirm={(time) =>
            onConfirm({
              date: DateTime.now()
                .set({
                  hour: time.hours,
                  minute: time.minutes,
                })
                .toJSDate(),
            })
          }
          label={label}
        />
      </Modal>
    </>
  );
}
