import * as React from 'react';
import { Platform, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Tappable from '../../Tappable';
import { useTheme } from '../../theme';
import IconButton from '../IconButton';
import Text from '../Text';
import Popover from './Popover';
import useOpenState from './useOpenState';

export type MenuItem = {
  label: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress(): void;
  /** Before the label, instead of an icon: an avatar */
  leading?: React.ReactNode;
  /** The current choice of a list of options: marked with a check and `aria-current` */
  selected?: boolean;
  disabled?: boolean;
  /** Shown in the blocked colour: deleting, leaving */
  destructive?: boolean;
  testID?: string;
};

export type MenuProps = {
  /** Names the menu, and its default trigger */
  label: string;
  items: MenuItem[];
  /** A pressable of your own; by default an icon button with three dots */
  trigger?: React.ReactElement<{ onPress?: () => void }>;
  /** A control of your own that opens the menu through `open`, instead of `trigger` (see `Popover`) */
  anchor?: React.ReactNode;
  /** Controlled open state; the menu keeps its own when absent */
  open?: boolean;
  onOpenChange?(open: boolean): void;
  testID?: string;
};

type MenuKeyEvent = {
  key: string;
  preventDefault(): void;
  currentTarget: { querySelectorAll(selector: string): ArrayLike<{ focus(): void }> };
  target: unknown;
};

/** Arrow keys, Home and End move between the items of a menu (web; native moves by swipe) */
function moveBetweenItems(event: MenuKeyEvent) {
  const items = Array.from(
    event.currentTarget.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')
  );
  const index = items.findIndex((item) => item === event.target);
  const last = items.length - 1;
  const next =
    event.key === 'ArrowDown'
      ? (index + 1) % items.length
      : event.key === 'ArrowUp'
        ? (index - 1 + items.length) % items.length
        : event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? last
            : null;
  if (next == null || !items.length) return;
  event.preventDefault();
  items[next].focus();
}

/**
 * A list of actions behind a button: `role="menu"` of `menuitem`s inside a popover, so it opens with Enter, closes on
 * Escape, returns focus to the trigger and, on the web, moves with the arrow keys. Choosing an item closes it.
 */
export default function Menu({
  label,
  items,
  trigger,
  anchor,
  open: openProp,
  onOpenChange,
  testID,
}: MenuProps) {
  const theme = useTheme();
  const [open, setOpen] = useOpenState(openProp, onOpenChange);
  const keys = Platform.OS === 'web' ? ({ onKeyDown: moveBetweenItems } as unknown as object) : {};

  return (
    <Popover
      label={label}
      open={open}
      onOpenChange={setOpen}
      align="end"
      flush
      testID={testID}
      anchor={anchor}
      trigger={
        anchor ? undefined : (trigger ?? <IconButton icon="dots-vertical" aria-label={label} />)
      }
    >
      <View role="menu" aria-label={label} {...keys}>
        {items.map((item) => (
          <Tappable
            key={item.label}
            role="menuitem"
            aria-label={item.label}
            aria-disabled={item.disabled}
            aria-current={item.selected ? true : undefined}
            disabled={item.disabled}
            testID={item.testID}
            minTarget={false}
            onPress={() => {
              setOpen(false);
              item.onPress();
            }}
            style={({ pressed, hovered, focused }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.space.md,
              minHeight: Math.max(theme.density.row, theme.density.touchTarget),
              paddingHorizontal: theme.space.lg,
              backgroundColor: item.selected
                ? theme.colour.brandSoft
                : pressed || hovered || focused
                  ? theme.colour.raised
                  : 'transparent',
              opacity: item.disabled ? 0.4 : 1,
            })}
          >
            {item.leading ?? null}
            {!item.leading && item.icon ? (
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color={item.destructive ? theme.colour.status.blocked.fg : theme.colour.text}
              />
            ) : null}
            <Text tone={item.destructive ? 'blocked' : item.selected ? 'onBrandSoft' : 'default'}>
              {item.label}
            </Text>
          </Tappable>
        ))}
      </View>
    </Popover>
  );
}
