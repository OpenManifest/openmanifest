import * as React from 'react';
import { List } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';

interface IDatepicker {
  label: string;
  timestamp: number;
  onChange(timestamp: number): void;
}
export default function DatePicker(props: IDatepicker) {
  const [open, setOpen] = React.useState(false);

  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = React.useCallback(
    ({ date }: { date: Date }) => {
      setOpen(false);
      props.onChange(date.getTime() / 1000);
    },
    [setOpen, props.onChange]
  );

  return (
    <>
      <List.Item
        title={props.label}
        description={props.timestamp ? new Date(props.timestamp * 1000).toISOString() : "-"}
      />
      <DatePickerModal
        mode="single"
        visible={open}
        onDismiss={onDismissSingle}
        date={props.timestamp ? new Date(props.timestamp * 1000) : new Date()}
        onConfirm={onConfirmSingle}
        label={props.label}
      />
    </>
  );
}