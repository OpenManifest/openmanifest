import { format } from 'date-fns';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { DatePickerModal, DatePickerModalSingleProps } from 'react-native-paper-dates';
import { Icon, ListRow } from 'app/ui';

interface IDatepicker extends Omit<
  DatePickerModalSingleProps,
  'onChange' | 'locale' | 'visible' | 'mode' | 'onDismiss' | 'onConfirm'
> {
  label?: string;
  value: number;
  disabled?: boolean;
  /** Ignored: the icon has the colour of the theme */
  color?: string;
  onChange(timestamp: number): void;
}

/** A row that shows the date (or the label over it) and opens the date picker when pressed */
export default function DatePicker(props: IDatepicker) {
  const { disabled, label, value, onChange, color: _color, ...datePickerProps } = props;
  const { t } = useTranslation('common');
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

  const timestampLabel = value ? format(value * 1000, 'yyyy/MM/dd') : t('picker.noDate');

  return (
    <>
      <ListRow
        title={label || timestampLabel}
        supporting={label ? timestampLabel : undefined}
        disabled={!!disabled}
        leading={<Icon name="calendar" tone="muted" />}
        onPress={() => setOpen(true)}
      />

      {/* Not mounted while closed: the modal needs the Paper theme only when it shows */}
      {open ? (
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
      ) : null}
    </>
  );
}
