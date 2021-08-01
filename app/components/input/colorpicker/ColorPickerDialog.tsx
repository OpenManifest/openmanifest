import * as React from 'react';
import { Button, Portal, Dialog } from 'react-native-paper';
import { TriangleColorPicker } from 'react-native-color-picker';
import SliderComponent from '@react-native-community/slider';

interface IColorPickerDialog {
  open: boolean;
  value: string;
  onChange(color: string): void;
  onClose(): void;
}
export default function ColorPickerDialog(props: IColorPickerDialog) {
  const { value, onChange, open, onClose } = props;

  const ref = React.useRef<TriangleColorPicker>();
  return (
    <Portal>
      <Dialog visible={!!open} onDismiss={() => onClose()}>
        <Dialog.Title>Custom color</Dialog.Title>
        <Dialog.Content style={{ padding: 20, height: 400 }}>
          <TriangleColorPicker
            style={{ flex: 1 }}
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sliderComponent={SliderComponent}
            defaultColor={value}
            hideSliders
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            ref={ref}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => onClose()}>Cancel</Button>
          <Button
            onPress={() => {
              if (ref.current) {
                onChange(ref.current?.getColor());
              }
            }}
          >
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
