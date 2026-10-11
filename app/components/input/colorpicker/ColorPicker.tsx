import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, HelperText, List, Surface, TextInput, TouchableRipple } from 'react-native-paper';
import manipulate from 'color';

export const COLOR_PRESETS = [
  '#000000',
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
  '#7A4A2B',
  '#5C6B73',
  '#E63946',
  '#1D3557',
];

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

interface IColorPicker {
  title: string;
  helperText: string;
  value: string;
  error?: string | null;
  onChange(color: string): void;
}

function ColorPicker(props: IColorPicker) {
  const { value, title, helperText, onChange, error } = props;

  const [text, setText] = React.useState(value || '');

  // Follow the value when it is changed from outside (a preset, a form reset)
  React.useEffect(() => {
    setText((current) =>
      current.toLowerCase() === (value || '').toLowerCase() ? current : value || ''
    );
  }, [value]);

  const isInvalid = text.length > 0 && !HEX_COLOR.test(text);

  return (
    <Card style={styles.card}>
      <List.Subheader>{title}</List.Subheader>

      <Card.Content style={styles.swatches}>
        {COLOR_PRESETS.map((color) => (
          <TouchableRipple
            key={color}
            accessibilityLabel={`Color ${color}`}
            onPress={() => {
              setText(color);
              onChange(color);
            }}
          >
            <Surface
              style={[
                styles.colorBox,
                styles.row,
                color.toLowerCase() === (value || '').toLowerCase() ? styles.selected : {},
              ]}
            >
              <View
                style={[styles.third, { backgroundColor: manipulate(color).lighten(0.6).hex() }]}
              />
              <View style={[styles.third, { backgroundColor: color }]} />
              <View
                style={[styles.third, { backgroundColor: manipulate(color).darken(0.3).hex() }]}
              />
            </Surface>
          </TouchableRipple>
        ))}
      </Card.Content>

      <Card.Content style={styles.hexRow}>
        <View
          style={[
            styles.preview,
            { backgroundColor: HEX_COLOR.test(value || '') ? value : '#FFFFFF' },
          ]}
        />
        <TextInput
          dense
          mode="outlined"
          label="Custom color (hex)"
          placeholder="#1D3557"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
          value={text}
          error={isInvalid}
          style={styles.hexInput}
          onChangeText={(newText) => {
            const normalised =
              newText.length > 0 && !newText.startsWith('#') ? `#${newText}` : newText;
            setText(normalised);
            if (HEX_COLOR.test(normalised)) {
              onChange(normalised);
            }
          }}
        />
      </Card.Content>
      <HelperText type={error || isInvalid ? 'error' : 'info'}>
        {isInvalid ? 'Use a hex color such as #1D3557' : error || helperText}
      </HelperText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { padding: 8, marginVertical: 16 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap' },
  row: { flexDirection: 'row' },
  third: { height: '100%', width: '33%' },
  selected: { borderWidth: 2, borderColor: 'black' },
  colorBox: {
    height: 25,
    width: 25,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  preview: {
    height: 32,
    width: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#999999',
    marginRight: 12,
  },
  hexInput: { flex: 1 },
});

export default ColorPicker;
