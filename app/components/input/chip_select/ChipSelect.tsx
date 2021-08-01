import { isEqual, pick, xorBy } from 'lodash';
import * as React from 'react';
import { View } from 'react-native';
import { Chip } from 'react-native-paper';

interface IChipSelect<T extends Record<string, unknown> | string> {
  items: T[];
  selected: T[];
  autoSelectFirst?: boolean;
  icon?: string;
  isSelected?(item: T): boolean;
  isDisabled?(item: T): boolean;
  renderItemLabel(item: T): React.ReactNode;
  onChangeSelected(newItems: T[]): void;
}
function ChipSelect<T extends Record<string, unknown> | string>(props: IChipSelect<T>) {
  const {
    items,
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
      {items.map((item) => (
        <Chip
          key={JSON.stringify(item)}
          mode="outlined"
          icon={!selected.some((value) => isEqual(item, value)) && icon ? icon : undefined}
          style={{ margin: 1 }}
          disabled={isDisabled?.(item) || false}
          selected={isSelected ? isSelected(item) : selected.some((value) => isEqual(item, value))}
          onPress={() =>
            onChangeSelected(
              selected.length === 1 ? [item] : xorBy(selected, [item], JSON.stringify)
            )
          }
        >
          {renderItemLabel(item)}
        </Chip>
      ))}
    </View>
  );
}

export default React.memo(ChipSelect, (previous, next) => {
  return isEqual(
    pick(previous, ['isDisabled', 'isSelected', 'items', 'selected']),
    pick(next, ['isDisabled', 'isSelected', 'items', 'selected'])
  );
}) as typeof ChipSelect;
