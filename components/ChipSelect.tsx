import { xorBy } from "lodash";
import React, { useEffect } from "react";
import { View } from "react-native";
import { Chip } from "react-native-paper";


interface IChipSelect<T extends { id: any }> {
  items: T[];
  selected: T[];
  autoSelectFirst?: boolean;
  isDisabled(item: T): boolean;
  renderItemLabel(item: T): React.ReactNode;
  onChangeSelected(newItems: T[]): void;
}
function ChipSelect<T extends { id: any }>(props: IChipSelect<T>) {
  const { items, selected, isDisabled, renderItemLabel, onChangeSelected, autoSelectFirst } = props;

  useEffect(() => {
    if (!selected || !selected.length && items.length && autoSelectFirst) {
      onChangeSelected(
        [items[0]]
      );
    }
  }, [JSON.stringify(selected), JSON.stringify(items), autoSelectFirst])

  return (
    <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
      { items.map((item) =>
        <Chip
          mode="outlined"
          style={{ margin: 1 }}
          disabled={isDisabled(item)}
          selected={selected.map(({ id }) => id).includes(item.id)}
          onPress={() =>
            onChangeSelected(
              selected.length === 1 ? [item] : xorBy(selected, [item], ({ id }) => id)
            )
          }
        >
          { renderItemLabel(item) }
        </Chip>
      )}
    </View>
  )
}

export default ChipSelect;