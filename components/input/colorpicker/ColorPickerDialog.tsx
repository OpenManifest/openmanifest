import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Portal, Dialog } from 'react-native-paper';
import { TriangleColorPicker } from "react-native-color-picker";
import SliderComponent from "@react-native-community/slider";

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
      <Dialog
        visible={!!open}
        onDismiss={() => onClose()}
      >
          <Dialog.Title>Custom color</Dialog.Title>
          <Dialog.Content style={{ padding: 20, height: 400 }}>
            { /* @ts-ignore */ }
            <TriangleColorPicker
              style={{ flex: 1 }}
              sliderComponent={SliderComponent as any}
              defaultColor={value}
              hideSliders
              ref={ref}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => onClose()}>Cancel</Button>
            <Button
              onPress={() => {
                onChange(ref.current.getColor());
              }}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  fields: {
    flexGrow: 1,
    display: "flex",
    width: "100%",
  },
  field: {
    marginBottom: 8,
    width: "100%",
  },
  subheader: {
    paddingLeft: 0
  }
});
