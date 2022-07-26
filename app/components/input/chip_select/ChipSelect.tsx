import { isEqual, pick, xorBy } from 'lodash';
import * as React from 'react';
import { Platform, View } from 'react-native';
import Chip, { ChipProps } from 'app/components/chips/Chip';

interface IChipSelect<T extends Record<string, unknown> | string> {
  items: T[];
  selected: T[];
  autoSelectFirst?: boolean;
  allowEmpty?: boolean;
  icon?: ChipProps['icon'];
  isSelected?(item: T): boolean;
  isDisabled?(item: T): boolean;
  renderItemLabel(item: T): React.ReactNode;
  onChangeSelected(newItems: T[]): void;
}
function ChipSelect<T extends Record<string, unknown> | string>(props: IChipSelect<T>) {
  const {
    items,
    allowEmpty,
    selected,
    isSelected,
    isDisabled,
    icon,
    renderItemLabel,
    onChangeSelected,
    autoSelectFirst,
  } = props;

  React.useEffect(() => {
    if (!selected || (!selected.length && items.length && autoSelectFirst)) {
      onChangeSelected([items[0]]);
    }
  }, [selected, autoSelectFirst, onChangeSelected, items]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
      {items.map((item) => {
        const isItemSelected = isSelected
          ? isSelected(item)
          : selected.some((value) => isEqual(item, value));
        return (
          <Chip
            key={JSON.stringify(item)}
            small
            mode={!isItemSelected ? 'flat' : 'outlined'}
            icon={!selected.some((value) => isEqual(item, value)) && icon ? icon : undefined}
            style={{ margin: Platform.OS === 'web' ? 4 : 1 }}
            disabled={isDisabled?.(item) || false}
            selected={isItemSelected}
            onPress={() =>
              onChangeSelected(
                !allowEmpty && selected.length === 1
                  ? [item]
                  : xorBy(selected, [item], JSON.stringify)
              )
            }
          >
            {renderItemLabel(item)}
          </Chip>
        );
      })}
    </View>
  );
}

export default React.memo(ChipSelect, (previous, next) => {
  return isEqual(
    pick(previous, ['isDisabled', 'isSelected', 'items', 'selected']),
    pick(next, ['isDisabled', 'isSelected', 'items', 'selected'])
  );
}) as typeof ChipSelect;
