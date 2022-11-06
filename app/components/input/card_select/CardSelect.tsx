import { isEqual, pick, xorBy } from 'lodash';
import * as React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';

interface ICardSelect<T extends Record<string, unknown> | string> {
  items: T[];
  selected: T[];
  autoSelectFirst?: boolean;
  isSelected?(item: T): boolean;
  renderItemLabel(item: T): React.ReactNode;
  onChangeSelected(newItems: T[]): void;
}
function CardSelect<T extends Record<string, unknown> | string>(props: ICardSelect<T>) {
  const { items, selected, isSelected, renderItemLabel, onChangeSelected, autoSelectFirst } = props;

  React.useEffect(() => {
    if (!selected || (!selected.length && items.length && autoSelectFirst)) {
      onChangeSelected([items[0]]);
    }
  }, [selected, autoSelectFirst, onChangeSelected, items]);

  return (
    <FlatList
      data={items}
      contentContainerStyle={{ paddingBottom: 120 }}
      keyExtractor={(item) => JSON.stringify(item)}
      renderItem={({ item }) => {
        const itemSelected = isSelected
          ? isSelected(item)
          : selected.some((value) => isEqual(item, value));

        return (
          <Card
            style={[styles.card, itemSelected ? styles.active : undefined]}
            onPress={() =>
              onChangeSelected(
                selected.length === 1 ? [item] : xorBy(selected, [item], JSON.stringify)
              )
            }
          >
            <Card.Title title={renderItemLabel(item)} />
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 48,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  title: {
    color: 'white',
    marginBottom: 100,
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    padding: 16,
    marginVertical: 4,
    flex: 1,
    opacity: 0.5,
  },
  active: {
    opacity: 1.0,
  },
});
export default React.memo(CardSelect, (previous, next) => {
  return isEqual(
    pick(previous, ['isDisabled', 'isSelected', 'items', 'selected']),
    pick(next, ['isDisabled', 'isSelected', 'items', 'selected'])
  );
}) as typeof CardSelect;
