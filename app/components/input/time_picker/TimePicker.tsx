import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { TimePickerModal } from 'react-native-paper-dates';
import { Icon, ListRow } from 'app/ui';
import { DateTime } from 'luxon';
import { clockInZone, resolveTimeZone, timeTodayInZone } from 'app/utils/operatorTime';

interface ITimePickerProps {
  label?: string;
  timestamp?: number;
  disabled?: boolean;
  /** Ignored: the icon has the colour of the theme */
  color?: string;
  /** The zone the time of day is in: the operator's (default: this device's) */
  timeZone?: string;
  onChange(timestamp: number): void;
}
export default function TimePicker(props: ITimePickerProps) {
  const { disabled, label, timestamp, onChange, timeZone } = props;
  const { t } = useTranslation('common');
  const zone = resolveTimeZone(timeZone);
  const [open, setOpen] = React.useState(false);

  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = React.useCallback(
    (hour: number, minute: number) => {
      setOpen(false);
      onChange(timeTodayInZone(hour, minute, zone));
    },
    [setOpen, onChange, zone]
  );

  const timestampLabel = timestamp ? clockInZone(timestamp, zone) : t('picker.noTime');
  const shown = DateTime.fromSeconds(timestamp || DateTime.local().toSeconds(), { zone });

  return (
    <>
      <ListRow
        title={label || timestampLabel}
        supporting={label ? timestampLabel : undefined}
        disabled={!!disabled}
        leading={<Icon name="clock-outline" tone="muted" />}
        onPress={() => setOpen(true)}
      />

      {/* Not mounted while closed: the modal needs the Paper theme only when it shows */}
      {open ? (
        <TimePickerModal
          hours={shown.hour}
          minutes={shown.minute}
          locale="en"
          visible={open}
          onDismiss={onDismissSingle}
          onConfirm={(time) => onConfirm(time.hours, time.minutes)}
          label={label}
        />
      ) : null}
    </>
  );
}
