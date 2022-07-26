import * as React from 'react';
import { GROUP_COLORS } from 'app/components/slots_table/UserRow';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Avatar } from 'react-native-paper';
import { sortedUniq } from 'lodash';

interface IGroupPickerProps {
  value?: number | null;
  availableGroups: number[];
  onChange(group: number): void;
}
export default function GroupPicker(props: IGroupPickerProps) {
  const { value, onChange, availableGroups } = props;
  const createChangeHandler = React.useCallback(
    (groupNumber: number | null) => () => onChange(groupNumber),
    [onChange]
  );
  return (
    <View style={styles.row}>
      {sortedUniq(availableGroups)
        .sort()
        ?.map((groupNumber) => (
          <TouchableOpacity onPress={createChangeHandler(groupNumber)}>
            <Avatar.Text
              label={`${groupNumber}`}
              size={20}
              style={[
                value === groupNumber ? styles.selected : undefined,
                { backgroundColor: GROUP_COLORS[groupNumber] },
              ]}
            />
          </TouchableOpacity>
        ))}
      <TouchableOpacity onPress={createChangeHandler(null)}>
        <Avatar.Icon
          icon="plus"
          size={20}
          style={[value === null ? styles.selected : undefined, { backgroundColor: '#FAFAFA' }]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 16,
    gap: 4,
  },
  selected: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
