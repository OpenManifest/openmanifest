import * as React from 'react';
import { Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';
import { Tappable, useStyles, useTheme } from 'app/ui';

const ICON_SIZE = 24;

export type NavItemProps = {
  label: string;
  icon: string;
  active: boolean;
  /** `bottom`: a column in a row; `rail`: a column at the side; `sidebar`: icon and label in a row */
  variant: 'bottom' | 'rail' | 'sidebar';
  onPress: () => void;
  testID?: string;
};

/** One destination in the tab bar, the rail or the sidebar. Active is brandSoft with brandText, which keeps its contrast in both schemes. */
export default function NavItem({ label, icon, active, variant, onPress, testID }: NavItemProps) {
  const styles = useStyles((t) => ({
    item: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: t.space.xs,
      paddingVertical: t.space.sm,
      paddingHorizontal: t.space.md,
      borderRadius: t.radius.md,
    },
    column: { flex: 1, flexDirection: 'column' },
    row: { flexDirection: 'row', justifyContent: 'flex-start', gap: t.space.md },
    active: { backgroundColor: t.colour.brandSoft },
    hovered: { backgroundColor: t.colour.raised },
    label: { ...t.type.label, color: t.colour.textMuted },
    labelActive: { color: t.colour.onBrandSoft },
    labelRow: { flexShrink: 1 },
  }));
  const theme = useTheme();
  const isRow = variant === 'sidebar';

  return (
    <Tappable
      role="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      testID={testID}
      onPress={onPress}
      style={({ hovered }) => ({
        ...styles.item,
        ...(isRow ? styles.row : styles.column),
        ...(active ? styles.active : hovered ? styles.hovered : {}),
      })}
    >
      <View>
        <MaterialCommunityIcons
          name={icon as never}
          size={ICON_SIZE}
          color={active ? theme.colour.brandText : theme.colour.textMuted}
        />
      </View>
      <Text
        numberOfLines={1}
        maxFontSizeMultiplier={CHROME_MAX_FONT_SIZE_MULTIPLIER}
        style={[
          styles.label,
          active ? styles.labelActive : undefined,
          isRow ? styles.labelRow : undefined,
        ]}
      >
        {label}
      </Text>
    </Tappable>
  );
}
