import * as React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useLinkTo } from '@react-navigation/native';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';
import { useOperatorContext } from 'app/providers/operator/context';
import { useSession } from 'app/state';
import { Tappable, useDevice, useStyles } from 'app/ui';
import type { Destination } from './destinations';
import NavItem from './NavItem';
import useDestinations from './useDestinations';

export const RAIL_WIDTH = 80;
export const SIDEBAR_WIDTH = 240;

/** Where the bar sits: at the bottom on a phone, at the left on a tablet and a desktop */
export function tabBarPositionFor(
  breakpoint: 'compact' | 'medium' | 'expanded'
): 'bottom' | 'left' {
  return breakpoint === 'compact' ? 'bottom' : 'left';
}

/**
 * The destinations shown in the bar. A phone has the primary ones (the rest are under More, with the account); wider
 * windows have everything that has a screen. The dashboard of the statistics and the platform overview share the
 * Overview tab: the first one the user may use names it. The account is not an item: it has its own button.
 */
export function barItems(destinations: Destination[], compact = false): Destination[] {
  const seen = new Set<string>();
  return destinations.filter((destination) => {
    if (destination.group === 'account') return false;
    if (compact && destination.group !== 'primary') return false;
    if (!destination.route && !destination.path) return false;
    if (destination.route) {
      if (seen.has(destination.route.tab)) return false;
      seen.add(destination.route.tab);
    }
    return true;
  });
}

/** The current item: the destination that is the home of the shown screen, else the one of the focused tab */
export function activeKey(items: Destination[], tab: string | undefined, leaf: string | null) {
  const home = items.find((item) => leaf && item.routeNames?.includes(leaf));
  if (home) return home.key;
  return items.find((item) => item.route?.tab === tab && !item.routeNames)?.key;
}

/**
 * The tab bar of the authenticated navigator, from the destinations table: bottom tabs on compact windows, a labelled
 * rail on medium ones and a sidebar with the operator and the account on expanded ones.
 */
export default function AppNavigation({ state, navigation }: BottomTabBarProps) {
  const { t } = useTranslation(['common', 'terms']);
  const { breakpoint } = useDevice();
  const { ready, destinations } = useDestinations();
  const linkTo = useLinkTo();
  const leaf = useSession((session) => session.currentRouteName);
  const {
    operator: { operator, currentUser },
  } = useOperatorContext();
  const focused = state.routes[state.index]?.name;
  const variant =
    breakpoint === 'compact' ? 'bottom' : breakpoint === 'medium' ? 'rail' : 'sidebar';
  const items = barItems(destinations, variant === 'bottom');
  const current = activeKey(items, focused, leaf);

  const styles = useStyles((theme) => ({
    bottom: {
      flexDirection: 'row',
      backgroundColor: theme.colour.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colour.border,
      paddingHorizontal: theme.space.xs,
      paddingVertical: theme.space.xs,
    },
    rail: {
      width: RAIL_WIDTH,
      backgroundColor: theme.colour.surface,
      borderRightWidth: 1,
      borderRightColor: theme.colour.border,
      paddingVertical: theme.space.md,
      gap: theme.space.xs,
      alignItems: 'stretch',
    },
    sidebar: {
      width: SIDEBAR_WIDTH,
      backgroundColor: theme.colour.surface,
      borderRightWidth: 1,
      borderRightColor: theme.colour.border,
      padding: theme.space.md,
      gap: theme.space.xs,
    },
    spacer: { flex: 1 },
    heading: { ...theme.type.label, color: theme.colour.textMuted },
    operator: { ...theme.type.title, color: theme.colour.text },
    account: {
      paddingVertical: theme.space.sm,
      paddingHorizontal: theme.space.md,
      borderRadius: theme.radius.md,
    },
    accountName: { ...theme.type.bodyCompact, color: theme.colour.text },
  }));

  const openTab = React.useCallback(
    (tab: string) => {
      const route = state.routes.find((candidate) => candidate.name === tab);
      if (!route) return;
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });
      if (!event.defaultPrevented) navigation.navigate(tab as never);
    },
    [navigation, state.routes]
  );
  const open = React.useCallback(
    (destination: Destination) => {
      // A path-based destination lives inside a tab: the linking config resolves it
      if (destination.path && !destination.route) linkTo(destination.path);
      else if (destination.route) openTab(destination.route.tab);
    },
    [linkTo, openTab]
  );

  if (!ready) return null;

  const list = items.map((destination) => (
    <NavItem
      key={destination.key}
      testID={`nav-${destination.key}`}
      label={t(destination.labelKey)}
      icon={destination.icon}
      active={destination.key === current}
      variant={variant}
      onPress={() => open(destination)}
    />
  ));
  const accountActive = focused === 'Account';

  if (variant === 'bottom') {
    return (
      <View role="navigation" aria-label={t('navigation.main')} style={styles.bottom}>
        {list}
        <NavItem
          testID="nav-more"
          label={t('destinations.more')}
          icon="dots-horizontal"
          active={focused === 'More' || accountActive}
          variant="bottom"
          onPress={() => openTab('More')}
        />
      </View>
    );
  }

  if (variant === 'rail') {
    return (
      <View role="navigation" aria-label={t('navigation.main')} style={styles.rail}>
        {list}
        <View style={styles.spacer} />
        <NavItem
          testID="nav-account"
          label={t('destinations.account')}
          icon="account-circle-outline"
          active={accountActive}
          variant="rail"
          onPress={() => openTab('Account')}
        />
      </View>
    );
  }

  return (
    <View role="navigation" aria-label={t('navigation.main')} style={styles.sidebar}>
      <Tappable
        role="button"
        aria-label={t('navigation.switchOperator')}
        testID="nav-operator"
        onPress={() => openTab('Account')}
      >
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={CHROME_MAX_FONT_SIZE_MULTIPLIER}
          style={styles.heading}
        >
          {t('terms:operator', { count: 1 })}
        </Text>
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={CHROME_MAX_FONT_SIZE_MULTIPLIER}
          style={styles.operator}
        >
          {operator?.name ?? ''}
        </Text>
      </Tappable>
      {list}
      <View style={styles.spacer} />
      <Tappable
        role="button"
        aria-label={t('navigation.account')}
        aria-current={accountActive ? 'page' : undefined}
        testID="nav-account"
        onPress={() => openTab('Account')}
        style={styles.account}
      >
        <Text numberOfLines={1} style={styles.accountName}>
          {currentUser?.user?.name ?? t('destinations.account')}
        </Text>
      </Tappable>
    </View>
  );
}
