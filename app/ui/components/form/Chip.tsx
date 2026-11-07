import * as React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Tappable from '../../Tappable';
import { useTheme } from '../../theme';
import IconButton from '../IconButton';
import Text from '../Text';

type ChipBase = {
  label: string;
  disabled?: boolean;
  testID?: string;
};

export type FilterChipProps = ChipBase & {
  /** A choice that can be on or off, one of several in a row */
  variant?: 'filter';
  selected?: boolean;
  onPress?(): void;
};

export type InputChipProps = ChipBase & {
  /** A value the person has entered (a name, a tag) that can be taken away */
  variant: 'input';
  onRemove?(): void;
  /** The name of the remove button (default "Remove <label>") */
  removeLabel?: string;
};

export type ChipProps = FilterChipProps | InputChipProps;

const HEIGHT = 32;

/**
 * A compact choice or value. A filter chip is a checkbox (`aria-checked`, a check mark when on); an input chip shows a
 * value and its own remove button. The touch target reaches the platform minimum with `hitSlop` while the chip stays small.
 */
export default function Chip(props: ChipProps) {
  const { label, disabled = false, testID } = props;
  const { t } = useTranslation('common');
  const theme = useTheme();
  const slop = Math.max(0, Math.ceil((theme.density.touchTarget - HEIGHT) / 2));
  const shape = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space.xs,
    height: HEIGHT,
    paddingHorizontal: theme.space.md,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  } as const;

  if (props.variant === 'input') {
    return (
      <View
        testID={testID}
        style={{
          ...shape,
          paddingEnd: theme.space.xs,
          borderColor: theme.colour.border,
          backgroundColor: theme.colour.raised,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text variant="label" numberOfLines={1}>
          {label}
        </Text>
        {props.onRemove ? (
          <IconButton
            dense
            size={16}
            icon="close"
            aria-label={props.removeLabel ?? t('form.remove', { label })}
            disabled={disabled}
            onPress={props.onRemove}
          />
        ) : null}
      </View>
    );
  }

  const selected = !!props.selected;
  return (
    <Tappable
      role="checkbox"
      aria-label={label}
      aria-checked={selected}
      aria-disabled={disabled}
      disabled={disabled}
      testID={testID}
      minTarget={false}
      hitSlop={slop}
      onPress={props.onPress}
      style={({ pressed, hovered }) => ({
        ...shape,
        borderColor: selected ? theme.colour.brand : theme.colour.border,
        backgroundColor: selected
          ? theme.colour.brandSoft
          : pressed || hovered
            ? theme.colour.raised
            : theme.colour.surface,
        opacity: disabled ? 0.5 : 1,
      })}
    >
      {selected ? (
        <MaterialCommunityIcons name="check" size={16} color={theme.colour.onBrandSoft} />
      ) : null}
      <Text variant="label" tone={selected ? 'onBrandSoft' : 'default'} numberOfLines={1}>
        {label}
      </Text>
    </Tappable>
  );
}
