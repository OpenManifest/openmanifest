import * as React from 'react';
import { View } from 'react-native';
import * as Primitive from '@rn-primitives/select';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Tappable from '../../Tappable';
import { useTheme } from '../../theme';
import Text from '../Text';
import Field, { fieldAria, useFieldIds } from './Field';
import type { SelectOption, SelectProps } from './Select';
import { useBoxStyle } from './TextField';
import { withHookForm } from './withHookForm';

export type { SelectOption, SelectProps } from './Select';

type ItemState = { hovered?: boolean; focused?: boolean; pressed?: boolean };

/**
 * One choice from many, on the web: `@rn-primitives/select` (Radix) gives the listbox its keyboard (Enter or Space
 * opens, the arrows move, Enter chooses, Escape closes and focus returns to the trigger). Two rules from the spike
 * (`docs/ui/spike-rn-primitives.md`): the items sit in a `Viewport`, and the trigger is our own pressable with
 * `role="combobox"` passed `asChild`, or the primitive would render a plain button under Radix's combobox attributes.
 */
function Select<Value extends string = string>({
  label,
  options,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  helperText,
  error,
  testID,
}: SelectProps<Value>) {
  const theme = useTheme();
  const ids = useFieldIds();
  const [open, setOpen] = React.useState(false);
  const chosen = options.find((option) => option.value === value);
  const box = useBoxStyle({ focused: open, error: !!error, disabled });

  return (
    <Field label={label} ids={ids} helperText={helperText} error={error}>
      <Primitive.Root
        value={chosen ? { value: chosen.value, label: chosen.label } : undefined}
        onValueChange={(option) => option && onChange?.(option.value as Value)}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) onBlur?.();
        }}
        disabled={disabled}
      >
        <Primitive.Trigger asChild>
          <Tappable
            role="combobox"
            {...fieldAria(ids, { helperText, error })}
            aria-label={label}
            aria-disabled={disabled}
            testID={testID}
            minTarget={false}
            style={{ ...box, justifyContent: 'space-between' }}
          >
            <View style={{ flexShrink: 1 }}>
              <Text tone={chosen ? 'default' : 'muted'} numberOfLines={1}>
                {chosen?.label ?? placeholder ?? ''}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colour.textMuted} />
          </Tappable>
        </Primitive.Trigger>
        <Primitive.Portal>
          <Primitive.Overlay>
            <Primitive.Content
              style={{
                minWidth: 200,
                backgroundColor: theme.colour.surface,
                borderRadius: theme.radius.md,
                borderWidth: 1,
                borderColor: theme.colour.border,
                ...theme.elevation.overlay,
              }}
            >
              <Primitive.Viewport>
                {options.map((option: SelectOption<Value>) => {
                  const selected = option.value === value;
                  return (
                    <Primitive.Item
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      disabled={option.disabled}
                      style={
                        ((state: ItemState) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: theme.space.md,
                          minHeight: theme.density.row,
                          paddingHorizontal: theme.space.lg,
                          backgroundColor: selected
                            ? theme.colour.brandSoft
                            : state.hovered || state.focused
                              ? theme.colour.raised
                              : 'transparent',
                          opacity: option.disabled ? 0.4 : 1,
                        })) as never
                      }
                    >
                      <Text tone={selected ? 'onBrandSoft' : 'default'}>{option.label}</Text>
                      {selected ? (
                        <MaterialCommunityIcons
                          name="check"
                          size={20}
                          color={theme.colour.onBrandSoft}
                        />
                      ) : null}
                    </Primitive.Item>
                  );
                })}
              </Primitive.Viewport>
            </Primitive.Content>
          </Primitive.Overlay>
        </Primitive.Portal>
      </Primitive.Root>
    </Field>
  );
}

export default Select;
export const FormSelect = withHookForm(Select);
