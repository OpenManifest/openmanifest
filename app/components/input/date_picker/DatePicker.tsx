import { format } from 'date-fns';
import * as React from 'react';
import { List, Modal } from 'react-native-paper';
import { DatePickerModal, DatePickerModalSingleProps } from 'react-native-paper-dates';

interface IDatepicker
  extends Omit<
    DatePickerModalSingleProps,
    'onChange' | 'locale' | 'visible' | 'mode' | 'onDismiss' | 'onConfirm'
  > {
  label?: string;
  value: number;
  disabled?: boolean;
  color?: string;
  onChange(timestamp: number): void;
}
export default function DatePicker(props: IDatepicker) {
  const { disabled, label, value, onChange, color, ...datePickerProps } = props;
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

  const timestampLabel = value ? format(value * 1000, 'yyyy/MM/dd') : 'No date selected';

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
          locale="en"
          visible={open}
          mode="single"
          onDismiss={onDismissSingle}
          date={value ? new Date(value * 1000) : new Date()}
          onConfirm={(date) => onConfirmSingle(date as { date: Date })}
          label={label}
          {...datePickerProps}
        />
      </Modal>
    </>
  );
}
