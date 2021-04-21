import * as React from 'react';
import { List, Menu } from 'react-native-paper';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import format from "date-fns/format";

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
    <Menu
      onDismiss={() => setOpen(false)}
      visible={open}
      anchor={
        <List.Item
          onPress={() => setOpen(true)}
          title="Reserve repack due date"
          description={
            props.timestamp ? 
              format(props.timestamp * 1000, "yyyy/MM/dd") :
              "No date selected"
          }
          left={() => <List.Icon icon="calendar" />}
        />
      }>
      <DayPicker
        selectedDays={props.timestamp ? [new Date(props.timestamp * 1000)] : []}
        
        onDayClick={(date) => {
          props.onChange(date.getTime() / 1000);
          setOpen(false);
        }}

      />
    </Menu>
    </>
  );
}