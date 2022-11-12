import * as React from 'react';
import { Button, Dialog } from 'react-native-paper';
import TimePicker from 'app/components/input/time_picker/TimePicker';

export interface ITimePickerDialog {
  open: boolean;
  onChange(time: number): void;
  onClose(): void;
}

export function TimePickerDialog(props: ITimePickerDialog) {
  const { open, onClose, onChange } = props;
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
      <Dialog.Title>Dispatch Aircraft</Dialog.Title>
      <Dialog.Content>
        <TimePicker onChange={setTime} timestamp={time} label="Take-off" />
      </Dialog.Content>
      <Dialog.Actions>
        <Button disabled={loading} onPress={onClose}>
          Cancel
        </Button>
        <Button disabled={loading} onPress={onSubmit}>
          Dispatch
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}
