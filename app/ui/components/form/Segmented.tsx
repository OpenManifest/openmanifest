import * as React from 'react';
import { Platform, View } from 'react-native';
import Tappable from '../../Tappable';
import { useTheme } from '../../theme';
import Text from '../Text';
import Field, { fieldAria, useFieldIds, type FieldMessages } from './Field';
import { withHookForm } from './withHookForm';

export type SegmentedOption<Value extends string = string> = {
  value: Value;
  label: string;
  disabled?: boolean;
};

export type SegmentedProps<Value extends string = string> = FieldMessages & {
  /** Names the group */
  label: string;
  options: SegmentedOption<Value>[];
  value?: Value | null;
  onChange?(value: Value): void;
  onBlur?(): void;
  disabled?: boolean;
  testID?: string;
};

/**
 * One choice from a few (two to five), all in view. A radio group: each segment is a radio with `aria-checked`, and on
 * the web the arrow keys move the choice, with only the chosen segment in the tab order.
 */
function Segmented<Value extends string = string>({
  label,
  options,
  value,
  onChange,
  onBlur,
  disabled = false,
  helperText,
  error,
  testID,
}: SegmentedProps<Value>) {
  const theme = useTheme();
  const ids = useFieldIds();
  const enabled = options.filter((option) => !option.disabled);
  const checked = options.find((option) => option.value === value);
  const tabStop = (checked ?? enabled[0])?.value;
  const radioId = (option: string) => `${ids.labelId}-radio-${option}`;

  const move = (from: Value, direction: 1 | -1) => {
    const index = enabled.findIndex((option) => option.value === from);
    const next = enabled[(index + direction + enabled.length) % enabled.length];
    if (next) {
      onChange?.(next.value);
      // Focus follows the choice, or the next arrow key would start from the radio left behind
      if (Platform.OS === 'web') document.getElementById(radioId(next.value))?.focus();
    }
  };

  return (
    <Field label={label} ids={ids} helperText={helperText} error={error}>
      <View
        role="radiogroup"
        {...fieldAria(ids, { helperText, error })}
        testID={testID}
        style={{
          flexDirection: 'row',
          borderRadius: theme.radius.md,
          borderWidth: error ? 2 : 1,
          borderColor: error ? theme.colour.status.blocked.fg : theme.colour.border,
          overflow: 'hidden',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {options.map((option, index) => {
          const selected = option.value === value;
          const inactive = disabled || option.disabled;
          const web =
            Platform.OS === 'web'
              ? ({
                  id: radioId(option.value),
                  tabIndex: option.value === tabStop ? 0 : -1,
                  onKeyDown: (event: { key: string; preventDefault(): void }) => {
                    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                      event.preventDefault();
                      move(option.value, 1);
                    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                      event.preventDefault();
                      move(option.value, -1);
                    }
                  },
                } as object)
              : {};

          return (
            <Tappable
              key={option.value}
              {...web}
              role="radio"
              aria-label={option.label}
              aria-checked={selected}
              aria-disabled={inactive}
              disabled={inactive}
              minTarget={false}
              onBlur={onBlur}
              onPress={() => onChange?.(option.value)}
              style={({ pressed, hovered }) => ({
                flexGrow: 1,
                flexBasis: 0,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: Math.max(theme.density.row, theme.density.touchTarget),
                paddingHorizontal: theme.space.md,
                borderStartWidth: index === 0 ? 0 : 1,
                borderColor: theme.colour.border,
                backgroundColor: selected
                  ? theme.colour.brandSoft
                  : pressed || hovered
                    ? theme.colour.raised
                    : theme.colour.surface,
                opacity: option.disabled ? 0.4 : 1,
              })}
            >
              <Text variant="label" tone={selected ? 'onBrandSoft' : 'default'} numberOfLines={1}>
                {option.label}
              </Text>
            </Tappable>
          );
        })}
      </View>
    </Field>
  );
}

export default Segmented;
export const FormSegmented = withHookForm(Segmented);
