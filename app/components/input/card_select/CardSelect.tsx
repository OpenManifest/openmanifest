import { isEqual, pick, xorBy } from 'lodash';
import * as React from 'react';
import { FlatList, View } from 'react-native';
import { Card, ListRow, useTheme } from 'app/ui';

interface ICardSelect<T extends Record<string, unknown> | string> {
  items: T[];
  selected: T[];
  autoSelectFirst?: boolean;
  isSelected?(item: T): boolean;
  renderItemLabel(item: T): React.ReactNode;
  onChangeSelected(newItems: T[]): void;
}

/** A list of cards, one per item, of which the chosen ones are marked: a card is a row that can be pressed */
function CardSelect<T extends Record<string, unknown> | string>(props: ICardSelect<T>) {
  const { items, selected, isSelected, renderItemLabel, onChangeSelected, autoSelectFirst } = props;
  const { space } = useTheme();

  React.useEffect(() => {
    if (!selected || (!selected.length && items.length && autoSelectFirst)) {
      onChangeSelected([items[0]]);
    }
  }, [selected, autoSelectFirst, onChangeSelected, items]);

  return (
    <FlatList
      data={items}
      // Room under the last card for the buttons of the screen
      contentContainerStyle={{ paddingBottom: space.xxxl * 2 }}
      ItemSeparatorComponent={() => <View style={{ height: space.sm }} />}
      keyExtractor={(item) => JSON.stringify(item)}
      renderItem={({ item }) => {
        const itemSelected = isSelected
          ? isSelected(item)
          : selected.some((value) => isEqual(item, value));

        return (
          <Card padding="none" variant={itemSelected ? 'raised' : 'flat'}>
            <ListRow
              title={String(renderItemLabel(item) ?? '')}
              selected={itemSelected}
              onPress={() =>
                onChangeSelected(
                  selected.length === 1 ? [item] : xorBy(selected, [item], JSON.stringify)
                )
              }
            />
          </Card>
        );
      }}
    />
  );
}

export default React.memo(CardSelect, (previous, next) => {
  return isEqual(
    pick(previous, ['isDisabled', 'isSelected', 'items', 'selected']),
    pick(next, ['isDisabled', 'isSelected', 'items', 'selected'])
  );
}) as typeof CardSelect;
