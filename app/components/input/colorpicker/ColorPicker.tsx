import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Card, HelperText, List, Surface, TouchableRipple } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import ColorPickerDialog from './ColorPickerDialog';

const COLOR_PRESETS = [
  '#000000',
  '#AAAAAA',
  '#DDDDDD',
  '#FF1414',
  '#D6116B',
  '#B70E97',
  '#6718AC',
  '#1E47AB',
  '#11839E',
  '#0DA583',
  '#10C626',
  '#92EA12',
  '#FF8B14',
  '#FFB214',
];

interface IColorPicker {
  title: string;
  helperText: string;
  value: string;
  error?: string | null;
  onChange(color: string): void;
}

function ColorPicker(props: IColorPicker) {
  const { value, title, helperText, onChange, error } = props;

  const isCustomColor = !COLOR_PRESETS.includes(value);
  const [isDialogOpen, setDialogOpen] = React.useState(false);
  return (
    <>
      <ColorPickerDialog
        open={isDialogOpen}
        value={value}
        onChange={(color) => {
          onChange(color);
          setDialogOpen(false);
        }}
        onClose={() => setDialogOpen(false)}
      />
      <Card style={styles.card}>
        <List.Subheader>{title}</List.Subheader>

        <Card.Content style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {COLOR_PRESETS.map((color) => (
            <TouchableRipple onPress={() => onChange(color)}>
              <Surface
                style={[
                  styles.colorBox,
                  { backgroundColor: color },
                  color === value ? { borderWidth: 2, borderColor: 'black' } : {},
                ]}
              >
                {null}
              </Surface>
            </TouchableRipple>
          ))}
          <TouchableRipple onPress={() => setDialogOpen(true)}>
            <Surface
              style={[
                styles.colorBox,
                { backgroundColor: isCustomColor ? value : '#FFFFFF' },
                isCustomColor ? { borderWidth: 2, borderColor: 'black' } : {},
              ]}
            >
              <MaterialIcons name="add" size={1} />
            </Surface>
          </TouchableRipple>
        </Card.Content>
        <HelperText type={error ? 'error' : 'info'}>{error || helperText}</HelperText>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  field: {
    marginBottom: 8,
  },
  content: {
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  card: { padding: 8, marginVertical: 16, height: 200 },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },

  colorBox: {
    height: 25,
    width: 25,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ColorPicker;
