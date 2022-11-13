import { isEqual, pick, xorBy } from 'lodash';
import * as React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import Chip, { ChipProps } from 'app/components/chips/Chip';
import { HelperText } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import { withHookForm } from '../withHookForm';

export interface IChipSelect<T> {
  items: T[];
  value: T[];
  autoSelectFirst?: boolean;
  allowEmpty?: boolean;
  icon?: ChipProps['icon'];
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

  const Wrapper = React.useCallback(
    ({ children }: React.PropsWithChildren<object>) =>
      variant === 'scroll' ? (
        <ScrollView horizontal>{children} </ScrollView>
      ) : (
        (children as JSX.Element)
      ),
    [variant]
  );

  return (
    <Wrapper>
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
              icon={
                !value?.some((selected) =>
                  isSelected ? isSelected(selected) : isEqual(item, selected)
                ) && icon
                  ? icon
                  : undefined
              }
              style={{ margin: Platform.OS === 'web' ? 4 : 1 }}
              disabled={isDisabled?.(item) || false}
              selected={isItemSelected}
              onPress={() =>
                onChange(
                  !allowEmpty && value.length === 1
                    ? [item]
                    : xorBy(value, [item], isSelected || JSON.stringify)
                )
              }
            >
              {renderItemLabel(item)}
            </Chip>
          );
        })}
      </View>
      <HelperText style={styles.helperText} type="error">
        {error || ''}
      </HelperText>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  helperText: {
    marginBottom: 16,
  },
});

const ChipSelectComponent = React.memo(ChipSelect, (previous, next) => {
  return isEqual(
    pick(previous, ['isDisabled', 'isSelected', 'items', 'selected', 'error']),
    pick(next, ['isDisabled', 'isSelected', 'items', 'selected', 'error'])
  );
}) as typeof ChipSelect;

export const ChipSelectField = withHookForm(ChipSelect);

export default ChipSelectComponent;
