import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import DayPicker from 'react-day-picker';
import 'react-day-picker/lib/style.css';
import format from 'date-fns/format';
import { Icon, ListRow, Popover } from 'app/ui';

interface IDatepicker {
  label: string;
  value: number;
  disabled?: boolean;
  onChange(value: number): void;
}

/** A row that shows the date and opens a calendar next to it when pressed (the web) */
export default function DatePicker(props: IDatepicker) {
  const { disabled, label, value, onChange } = props;
  const { t } = useTranslation('common');
  const [open, setOpen] = React.useState(false);

  return (
    <Popover
      label={label}
      open={open}
      onOpenChange={setOpen}
      anchor={
        <View>
          <ListRow
            onPress={() => setOpen(true)}
            disabled={!!disabled}
            title={label}
            supporting={value ? format(value * 1000, 'yyyy/MM/dd') : t('picker.noDate')}
            leading={<Icon name="calendar" tone="muted" />}
          />
        </View>
      }
    >
      <DayPicker
        selectedDays={value ? [new Date(value * 1000)] : []}
        onDayClick={(date) => {
          onChange(date.getTime() / 1000);
          setOpen(false);
        }}
      />
    </Popover>
  );
}
