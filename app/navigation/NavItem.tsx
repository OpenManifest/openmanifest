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
  /** How many things wait for the person here (unread notifications): shown on the icon, spoken with the label */
  badge?: number;
  /** The accessible name when it says more than the label ("Inbox, 3 unread") */
  accessibilityLabel?: string;
  testID?: string;
};

/** One destination in the tab bar, the rail or the sidebar. Active is brandSoft with brandText, which keeps its contrast in both schemes. */
export default function NavItem({
  label,
  icon,
  active,
  variant,
  onPress,
  badge = 0,
  accessibilityLabel,
  testID,
}: NavItemProps) {
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
    badge: {
      position: 'absolute',
      top: -t.space.xs,
      right: -t.space.md,
      minWidth: 18,
      height: 18,
      paddingHorizontal: t.space.xs,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.colour.status.blocked.bg,
      borderWidth: 1,
      borderColor: t.colour.status.blocked.fg,
    },
    badgeText: { ...t.type.caption, color: t.colour.status.blocked.fg, fontWeight: '700' },
  }));
  const theme = useTheme();
  const isRow = variant === 'sidebar';

  return (
    <Tappable
      role="button"
      aria-label={accessibilityLabel ?? label}
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
        {badge > 0 ? (
          <View style={styles.badge} testID={testID ? `${testID}-badge` : undefined}>
            <Text maxFontSizeMultiplier={CHROME_MAX_FONT_SIZE_MULTIPLIER} style={styles.badgeText}>
              {badge > 99 ? '99+' : badge}
            </Text>
          </View>
        ) : null}
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
