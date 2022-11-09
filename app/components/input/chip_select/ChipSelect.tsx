import { isEqual, pick, xorBy } from 'lodash';
import * as React from 'react';
import { Platform, View } from 'react-native';
import Chip, { ChipProps } from 'app/components/chips/Chip';
import { HelperText } from 'react-native-paper';
import { withHookForm } from '../withHookForm';

interface IChipSelect<T> {
  items: T[];
  value: T[];
  autoSelectFirst?: boolean;
  allowEmpty?: boolean;
  icon?: ChipProps['icon'];
  error?: string | null;
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
    isSelected,
    isDisabled,
    icon,
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

  return (
    <>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {items?.map((item) => {
          const isItemSelected = isSelected
            ? isSelected(item)
            : value.some((selected) => isEqual(item, selected));
          return (
            <Chip
              key={JSON.stringify(item)}
              small
              mode={!isItemSelected ? 'flat' : 'outlined'}
              icon={!value.some((selected) => isEqual(item, selected)) && icon ? icon : undefined}
              style={{ margin: Platform.OS === 'web' ? 4 : 1 }}
              disabled={isDisabled?.(item) || false}
              selected={isItemSelected}
              onPress={() =>
                onChange(
                  !allowEmpty && value.length === 1 ? [item] : xorBy(value, [item], JSON.stringify)
                )
              }
            >
              {renderItemLabel(item)}
            </Chip>
          );
        })}
      </View>
      <HelperText type="error">{error || ''}</HelperText>
    </>
  );
}

const ChipSelectComponent = React.memo(ChipSelect, (previous, next) => {
  return isEqual(
    pick(previous, ['isDisabled', 'isSelected', 'items', 'selected']),
    pick(next, ['isDisabled', 'isSelected', 'items', 'selected'])
  );
}) as typeof ChipSelect;

export const ChipSelectField = withHookForm(ChipSelect);

export default ChipSelectComponent;
