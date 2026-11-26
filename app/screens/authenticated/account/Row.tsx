import * as React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tappable, useStyles, useTheme } from 'app/ui';

const ICON_SIZE = 24;

type RowProps = {
  label: string;
  icon?: string;
  /** What the row does when it is a button; a radio is a choice in a group, selected or not */
  onPress: () => void;
  role?: 'button' | 'radio';
  selected?: boolean;
  testID?: string;
  detail?: string;
};

/** A line of a list in the account and more screens (a stand-in for the ListRow of U2.4). */
export default function Row({
  label,
  icon,
  onPress,
  role = 'button',
  selected,
  testID,
  detail,
}: RowProps) {
  const theme = useTheme();
  const styles = useStyles((t) => ({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: t.space.md,
      minHeight: t.density.row,
      paddingHorizontal: t.space.lg,
      backgroundColor: t.colour.surface,
    },
    selected: { backgroundColor: t.colour.brandSoft },
    label: { ...t.type.body, color: t.colour.text, flexGrow: 1, flexShrink: 1 },
    detail: { ...t.type.caption, color: t.colour.textMuted },
  }));

  return (
    <Tappable
      role={role}
      aria-label={label}
      aria-checked={role === 'radio' ? !!selected : undefined}
      testID={testID}
      onPress={onPress}
      style={{ ...styles.row, ...(selected ? styles.selected : {}) }}
    >
      {icon ? (
        <View>
          <MaterialCommunityIcons
            name={icon as never}
            size={ICON_SIZE}
            color={selected ? theme.colour.brandText : theme.colour.textMuted}
          />
        </View>
      ) : null}
      <Text style={styles.label}>{label}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      {selected ? (
        <MaterialCommunityIcons name="check" size={ICON_SIZE} color={theme.colour.brandText} />
      ) : null}
    </Tappable>
  );
}
