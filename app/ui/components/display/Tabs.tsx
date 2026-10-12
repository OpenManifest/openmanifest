import * as React from 'react';
import { Platform, View } from 'react-native';
import Tappable from '../../Tappable';
import { useTheme } from '../../theme';
import Text from '../Text';

export type TabItem<Value extends string = string> = {
  value: Value;
  label: string;
  disabled?: boolean;
};

export type TabsProps<Value extends string = string> = {
  /** Names the tab list ("Sections") */
  label: string;
  tabs: TabItem<Value>[];
  value: Value;
  onChange(value: Value): void;
  /** The content of the chosen tab */
  children?: React.ReactNode;
  testID?: string;
};

/**
 * Tabs that switch what is shown below them: a `tablist` of `tab`s (the chosen one `aria-selected`) and a `tabpanel`
 * named by it. On the web the arrow keys, Home and End move the choice and only the chosen tab is in the tab order.
 */
export default function Tabs<Value extends string = string>({
  label,
  tabs,
  value,
  onChange,
  children,
  testID,
}: TabsProps<Value>) {
  const theme = useTheme();
  const base = React.useId();
  const enabled = tabs.filter((tab) => !tab.disabled);
  const tabId = (tab: string) => `${base}-tab-${tab}`;
  const panelId = `${base}-panel`;

  const move = (from: Value, to: 'next' | 'previous' | 'first' | 'last') => {
    const index = enabled.findIndex((tab) => tab.value === from);
    const target =
      to === 'first'
        ? enabled[0]
        : to === 'last'
          ? enabled[enabled.length - 1]
          : enabled[(index + (to === 'next' ? 1 : -1) + enabled.length) % enabled.length];
    if (target) onChange(target.value);
  };

  return (
    <View testID={testID}>
      <View
        role="tablist"
        aria-label={label}
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: theme.colour.border,
        }}
      >
        {tabs.map((tab) => {
          const selected = tab.value === value;
          const web =
            Platform.OS === 'web'
              ? ({
                  id: tabId(tab.value),
                  tabIndex: selected ? 0 : -1,
                  'aria-controls': selected ? panelId : undefined,
                  onKeyDown: (event: { key: string; preventDefault(): void }) => {
                    const keys = {
                      ArrowRight: 'next',
                      ArrowLeft: 'previous',
                      Home: 'first',
                      End: 'last',
                    } as const;
                    const to = keys[event.key as keyof typeof keys];
                    if (to) {
                      event.preventDefault();
                      move(tab.value, to);
                    }
                  },
                } as object)
              : {};

          return (
            <Tappable
              key={tab.value}
              {...web}
              role="tab"
              aria-label={tab.label}
              aria-selected={selected}
              aria-disabled={tab.disabled}
              disabled={tab.disabled}
              minTarget={false}
              onPress={() => onChange(tab.value)}
              style={({ pressed, hovered }) => ({
                flexGrow: 1,
                flexBasis: 0,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: Math.max(theme.density.row, theme.density.touchTarget),
                paddingHorizontal: theme.space.md,
                borderBottomWidth: 2,
                borderBottomColor: selected ? theme.colour.brand : 'transparent',
                backgroundColor: pressed || hovered ? theme.colour.raised : 'transparent',
                opacity: tab.disabled ? 0.4 : 1,
              })}
            >
              <Text variant="label" tone={selected ? 'brand' : 'muted'} numberOfLines={1}>
                {tab.label}
              </Text>
            </Tappable>
          );
        })}
      </View>
      <View
        role="tabpanel"
        nativeID={panelId}
        aria-labelledby={tabId(value)}
        style={{ paddingTop: theme.space.lg }}
      >
        {children}
      </View>
    </View>
  );
}
