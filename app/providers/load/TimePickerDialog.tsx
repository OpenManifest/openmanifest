import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog } from 'react-native-paper';
import TimePicker from 'app/components/input/time_picker/TimePicker';
import { useOperatorTimeZone } from 'app/hooks/useOperatorToday';

export interface ITimePickerDialog {
  open: boolean;
  onChange(time: number): void;
  onClose(): void;
}

export function TimePickerDialog(props: ITimePickerDialog) {
  const { open, onClose, onChange } = props;
  const timeZone = useOperatorTimeZone();
  const { t } = useTranslation(['common', 'terms']);
  const [time, setTime] = React.useState<number>();
  const [loading, setLoading] = React.useState(false);

  const onSubmit = React.useCallback(() => {
    try {
      setLoading(true);
      if (time) {
        onChange(time);
      }
    } finally {
      setLoading(false);
    }
  }, [onChange, time]);

  return (
    <Dialog visible={open} dismissable onDismiss={onClose}>
      <Dialog.Title>
        {t('common:legacy.dispatch.title', { vehicle: t('terms:vehicle', { count: 1 }) })}
      </Dialog.Title>
      <Dialog.Content>
        <TimePicker
          onChange={setTime}
          timestamp={time}
          timeZone={timeZone}
          label={t('common:legacy.dispatch.time')}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button disabled={loading} onPress={onClose}>
          {t('common:legacy.cancel')}
        </Button>
        <Button disabled={loading} onPress={onSubmit}>
          {t('common:legacy.dispatch.submit')}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
