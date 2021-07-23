import { format } from 'date-fns';
import * as React from 'react';
import { List, Modal } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates/src';

interface IDatepicker {
  label?: string;
  timestamp: number;
  disabled?: boolean;
  color?: string;
  onChange(timestamp: number): void;
}
export default function DatePicker(props: IDatepicker) {
  const { disabled, label, timestamp, onChange, color } = props;
  const [open, setOpen] = React.useState(false);

  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = React.useCallback(
    ({ date }: { date: Date }) => {
      setOpen(false);
      onChange(date.getTime() / 1000);
    },
    [setOpen, onChange]
  );

  const timestampLabel = timestamp ? format(timestamp * 1000, 'yyyy/MM/dd') : 'No date selected';

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
        <DatePickerModal
          visible={open}
          mode="single"
          onDismiss={onDismissSingle}
          date={timestamp ? new Date(timestamp * 1000) : new Date()}
          onConfirm={(date) => onConfirmSingle(date as { date: Date })}
          label={label}
        />
      </Modal>
    </>
  );
}
