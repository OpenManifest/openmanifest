import * as React from 'react';
import { List, Menu } from 'react-native-paper';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import format from 'date-fns/format';

interface IDatepicker {
  label: string;
  timestamp: number;
  disabled?: boolean;
  onChange(timestamp: number): void;
}
export default function DatePicker(props: IDatepicker) {
  const { disabled, label, timestamp, onChange } = props;
  const [open, setOpen] = React.useState(false);

  const left = React.useCallback(() => <List.Icon icon="calendar" />, []);
  return (
    <Menu
      onDismiss={() => setOpen(false)}
      visible={open}
      anchor={
        <List.Item
          onPress={() => setOpen(true)}
          disabled={!!disabled}
          title={label}
          description={timestamp ? format(timestamp * 1000, 'yyyy/MM/dd') : 'No date selected'}
          left={left}
        />
      }
    >
      <DayPicker
        selectedDays={timestamp ? [new Date(timestamp * 1000)] : []}
        onDayClick={(date) => {
          onChange(date.getTime() / 1000);
          setOpen(false);
        }}
      />
    </Menu>
  );
}
