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

  const timestampLabel = props.timestamp ? 
    format(props.timestamp * 1000, "yyyy/MM/dd") :
    "No date selected";
    
  return (
    <>
      <List.Item
        title={props.label || timestampLabel}
        disabled={!!props.disabled}
        description={
          !props.label
            ? null
            : timestampLabel
        }
        left={() => <List.Icon color={props.color} icon="calendar" />}
        onPress={() => setOpen(true)}
      />

      <Modal visible={open}>
        <DatePickerModal
          visible={open}
          mode="single"
          onDismiss={onDismissSingle}
          date={props.timestamp ? new Date(props.timestamp * 1000) : new Date()}
          onConfirm={(date: any) => onConfirmSingle(date)}
          label={props.label}
        />
      </Modal>
    </>
  );
}