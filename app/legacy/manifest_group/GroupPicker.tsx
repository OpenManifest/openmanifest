import * as React from 'react';
import { GROUP_COLORS } from 'app/components/slots_table/UserRow';
import { View, StyleSheet } from 'react-native';
import { Icon, Tappable, Text, useTheme } from 'app/ui';
import { sortedUniq } from 'lodash';

interface IGroupPickerProps {
  value?: number | null;
  availableGroups: number[];
  onChange(group: number | null): void;
}
export default function GroupPicker(props: IGroupPickerProps) {
  const { value, onChange, availableGroups } = props;
  const createChangeHandler = React.useCallback(
    (groupNumber: number | null) => () => onChange(groupNumber),
    [onChange]
  );
  const theme = useTheme();
  const dot = (selected: boolean) => ({
    width: 24,
    height: 24,
    borderRadius: theme.radius.pill,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: selected ? 2 : 0,
    borderColor: theme.colour.text,
  });
  return (
    <View style={styles.row}>
      {sortedUniq(availableGroups)
        .sort()
        ?.map((groupNumber) => (
          <Tappable
            key={groupNumber}
            role="radio"
            aria-label={`Group ${groupNumber}`}
            aria-checked={value === groupNumber}
            onPress={createChangeHandler(groupNumber)}
            style={{ ...dot(value === groupNumber), backgroundColor: GROUP_COLORS[groupNumber] }}
          >
            <Text variant="caption">{`${groupNumber}`}</Text>
          </Tappable>
        ))}
      <Tappable
        role="radio"
        aria-label="New group"
        aria-checked={value === null}
        onPress={createChangeHandler(null)}
        style={{ ...dot(value === null), backgroundColor: theme.colour.raised }}
      >
        <Icon name="plus" size={16} />
      </Tappable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 16,
    gap: 4,
  },
});
