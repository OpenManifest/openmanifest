import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import manipulate from 'color';
import {
  COLOUR_PRESETS,
  Card,
  Row,
  Stack,
  Subheader,
  Tappable,
  Text,
  TextField,
  useTheme,
} from 'app/ui';

export const COLOR_PRESETS: readonly string[] = COLOUR_PRESETS;

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

interface IColorPicker {
  title: string;
  helperText: string;
  value: string;
  error?: string | null;
  onChange(color: string): void;
}

const SWATCH = 32;
const PREVIEW = 32;

/** A grid of preset colours and a field for a hex value, with a preview of the colour */
function ColorPicker(props: IColorPicker) {
  const { value, title, helperText, onChange, error } = props;
  const { t } = useTranslation('common');
  const theme = useTheme();

  const [text, setText] = React.useState(value || '');

  // Follow the value when it is changed from outside (a preset, a form reset)
  const [seen, setSeen] = React.useState(value);
  if (value !== seen) {
    setSeen(value);
    setText((current) =>
      current.toLowerCase() === (value || '').toLowerCase() ? current : value || ''
    );
  }

  const isInvalid = text.length > 0 && !HEX_COLOR.test(text);

  return (
    <Card>
      <Stack gap="md">
        <Subheader>{title}</Subheader>

        <Row gap="sm" wrap>
          {COLOR_PRESETS.map((color) => {
            const selected = color.toLowerCase() === (value || '').toLowerCase();
            return (
              <Tappable
                key={color}
                role="button"
                aria-label={t('colour.swatch', { colour: color })}
                aria-pressed={selected}
                onPress={() => {
                  setText(color);
                  onChange(color);
                }}
                style={{
                  flexDirection: 'row',
                  width: SWATCH,
                  height: SWATCH,
                  overflow: 'hidden',
                  borderRadius: theme.radius.sm,
                  borderWidth: selected ? 3 : 1,
                  borderColor: selected ? theme.colour.text : theme.colour.border,
                }}
              >
                {[
                  manipulate(color).lighten(0.6).hex(),
                  color,
                  manipulate(color).darken(0.3).hex(),
                ].map((shade) => (
                  <View key={shade} style={{ flex: 1, backgroundColor: shade }} />
                ))}
              </Tappable>
            );
          })}
        </Row>

        <Row gap="md" align="center">
          <View
            aria-hidden
            style={{
              width: PREVIEW,
              height: PREVIEW,
              borderRadius: theme.radius.pill,
              borderWidth: 1,
              borderColor: theme.colour.border,
              backgroundColor: HEX_COLOR.test(value || '') ? value : theme.colour.surface,
            }}
          />
          <View style={{ flex: 1 }}>
            <TextField
              label={t('colour.custom')}
              placeholder={COLOR_PRESETS[COLOR_PRESETS.length - 1]}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={7}
              value={text}
              error={isInvalid ? t('colour.invalid') : error}
              onChange={(newText) => {
                const normalised =
                  newText.length > 0 && !newText.startsWith('#') ? `#${newText}` : newText;
                setText(normalised);
                if (HEX_COLOR.test(normalised)) {
                  onChange(normalised);
                }
              }}
            />
          </View>
        </Row>
        {!isInvalid && !error ? (
          <Text variant="caption" tone="muted">
            {helperText}
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}

export default ColorPicker;
