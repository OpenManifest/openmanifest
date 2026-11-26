import { isEqual, pick, xorBy } from 'lodash';
import * as React from 'react';
import { ScrollView } from 'react-native';
import { Chip, Row, Stack, Text, type IconName } from 'app/ui';
import { withHookForm } from '../withHookForm';

export interface IChipSelect<T> {
  items: T[];
  value: T[];
  autoSelectFirst?: boolean;
  allowEmpty?: boolean;
  /** Ignored: a chosen chip shows a check mark */
  icon?: IconName;
  error?: string | null;
  variant?: 'scroll' | 'flat';
  isSelected?(item: T): boolean;
  isDisabled?(item: T): boolean;
  renderItemLabel(item: T): React.ReactNode;
  onChange(newItems: T[]): void;
}

function ChipSelect<T>(props: IChipSelect<T>) {
  const {
    items,
    allowEmpty,
    value,
    variant = 'flat',
    isSelected,
    isDisabled,
    renderItemLabel,
    onChange,
    autoSelectFirst,
    error,
  } = props;

  React.useEffect(() => {
    if (items?.length && (!value || !value.length) && autoSelectFirst) {
      onChange([items[0]]);
    }
  }, [value, autoSelectFirst, onChange, items]);

  const chips = (
    <Row gap="sm" wrap={variant !== 'scroll'}>
      {items?.map((item) => {
        const isItemSelected = isSelected
          ? isSelected(item)
          : (value ?? []).some((selected) => isEqual(item, selected));
        return (
          <Chip
            key={JSON.stringify(item)}
            label={String(renderItemLabel(item) ?? '')}
            disabled={isDisabled?.(item) || false}
            selected={isItemSelected}
            onPress={() =>
              onChange(
                !allowEmpty && value.length === 1
                  ? [item]
                  : xorBy(value, [item], isSelected || JSON.stringify)
              )
            }
          />
        );
      })}
    </Row>
  );

  return (
    <Stack gap="xs">
      {variant === 'scroll' ? <ScrollView horizontal>{chips}</ScrollView> : chips}
      {error ? (
        <Text variant="caption" tone="blocked" role="alert">
          {error}
        </Text>
      ) : null}
    </Stack>
  );
}

const ChipSelectComponent = React.memo(ChipSelect, (previous, next) => {
  return isEqual(
    pick(previous, ['isDisabled', 'isSelected', 'items', 'selected', 'error']),
    pick(next, ['isDisabled', 'isSelected', 'items', 'selected', 'error'])
  );
}) as typeof ChipSelect;

export const ChipSelectField = withHookForm(ChipSelect);

export default ChipSelectComponent;
