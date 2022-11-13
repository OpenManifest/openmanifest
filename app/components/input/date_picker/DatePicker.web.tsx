import * as React from 'react';
import { List } from 'react-native-paper';
import DayPicker from 'react-day-picker';
import Menu from 'app/components/popover/Menu';
import 'react-day-picker/lib/style.css';
import format from 'date-fns/format';
import { View } from 'react-native';

interface IDatepicker {
  label: string;
  value: number;
  disabled?: boolean;
  onChange(value: number): void;
}
export default function DatePicker(props: IDatepicker) {
  const { disabled, label, value, onChange } = props;
  const [open, setOpen] = React.useState(false);

  const left = React.useCallback(() => <List.Icon icon="calendar" />, []);
  return (
    <Menu
      {...{ open, setOpen }}
      anchor={
        <List.Item
          onPress={() => setOpen(true)}
          disabled={!!disabled}
          title={label}
          description={value ? format(value * 1000, 'yyyy/MM/dd') : 'No date selected'}
          left={left}
        />
      }
    >
      <View style={{ zIndex: 1500 }}>
        <DayPicker
          selectedDays={value ? [new Date(value * 1000)] : []}
          onDayClick={(date) => {
            onChange(date.getTime() / 1000);
            setOpen(false);
          }}
        />
      </View>
    </Menu>
  );
}
