import * as React from 'react';
import { FlatList, Modal, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Tappable from '../../Tappable';
import { useTheme } from '../../theme';
import Divider from '../Divider';
import Text from '../Text';
import Field, { fieldAria, useFieldIds, type FieldMessages } from './Field';
import { useBoxStyle } from './TextField';
import { withHookForm } from './withHookForm';

export type SelectOption<Value extends string = string> = {
  value: Value;
  label: string;
  disabled?: boolean;
};

export type SelectProps<Value extends string = string> = FieldMessages & {
  label: string;
  options: SelectOption<Value>[];
  value?: Value | null;
  onChange?(value: Value): void;
  onBlur?(): void;
  placeholder?: string;
  disabled?: boolean;
  testID?: string;
};

/**
 * One choice from many. On phones and tablets (here) the list opens in a panel over the screen: the trigger is a
 * combobox, the list of options with the chosen one marked, and the backdrop closes it. The web build has its
 * own (`Select.web.tsx`, on `@rn-primitives/select`) with the same props.
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
  const { t } = useTranslation('common');
  const theme = useTheme();
  const ids = useFieldIds();
  const [open, setOpen] = React.useState(false);
  const chosen = options.find((option) => option.value === value);
  const box = useBoxStyle({ focused: open, error: !!error, disabled });
  const close = () => {
    setOpen(false);
    onBlur?.();
  };

  return (
    <Field label={label} ids={ids} helperText={helperText} error={error}>
      <Tappable
        role="combobox"
        {...fieldAria(ids, { helperText, error })}
        aria-label={label}
        aria-expanded={open}
        aria-disabled={disabled}
        disabled={disabled}
        testID={testID}
        minTarget={false}
        onPress={() => setOpen(true)}
        style={{ ...box, justifyContent: 'space-between' }}
      >
        <View style={{ flexShrink: 1 }}>
          <Text tone={chosen && !disabled ? 'default' : 'muted'} numberOfLines={1}>
            {chosen?.label ?? placeholder ?? ''}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-down" size={20} color={theme.colour.textMuted} />
      </Tappable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Tappable
            role="button"
            aria-label={t('form.cancel')}
            minTarget={false}
            onPress={close}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              start: 0,
              end: 0,
              backgroundColor: theme.colour.scrim,
            }}
          />
          <View
            style={{
              maxHeight: '60%',
              backgroundColor: theme.colour.surface,
              borderTopStartRadius: theme.radius.lg,
              borderTopEndRadius: theme.radius.lg,
              paddingBottom: theme.space.lg,
            }}
          >
            <View style={{ padding: theme.space.lg }}>
              <Text variant="title" role="heading">
                {label}
              </Text>
            </View>
            <FlatList
              aria-label={label}
              data={options}
              keyExtractor={(option) => option.value}
              ItemSeparatorComponent={Divider}
              renderItem={({ item }) => {
                const selected = item.value === value;
                return (
                  <Tappable
                    role="option"
                    aria-label={item.label}
                    aria-selected={selected}
                    aria-disabled={item.disabled}
                    disabled={item.disabled}
                    minTarget={false}
                    onPress={() => {
                      onChange?.(item.value);
                      close();
                    }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      minHeight: theme.density.row,
                      paddingHorizontal: theme.space.lg,
                      backgroundColor: selected
                        ? theme.colour.brandSoft
                        : pressed
                          ? theme.colour.raised
                          : 'transparent',
                      opacity: item.disabled ? 0.4 : 1,
                    })}
                  >
                    <Text tone={selected ? 'onBrandSoft' : 'default'}>{item.label}</Text>
                    {selected ? (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color={theme.colour.onBrandSoft}
                      />
                    ) : null}
                  </Tappable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </Field>
  );
}

export default Select;
export const FormSelect = withHookForm(Select);
