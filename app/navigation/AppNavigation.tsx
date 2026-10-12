import * as React from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { DrawerActions } from '@react-navigation/native';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';
import { useOperatorContext } from 'app/providers/operator/context';
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
 * The destinations that have a screen today, one per tab (the dashboard of the statistics and the platform overview
 * share the Overview tab: the first one the user may use names it).
 */
export function barItems(
  destinations: Destination[]
): (Destination & { route: NonNullable<Destination['route']> })[] {
  const seen = new Set<string>();
  return destinations.filter(
    (destination): destination is Destination & { route: NonNullable<Destination['route']> } => {
      if (!destination.route || seen.has(destination.route.tab)) return false;
      seen.add(destination.route.tab);
      return true;
    }
  );
}

/**
 * The tab bar of the authenticated navigator, from the destinations table: bottom tabs on compact windows, a labelled
 * rail on medium ones and a sidebar with the operator and the account on expanded ones.
 */
export default function AppNavigation({ state, navigation }: BottomTabBarProps) {
  const { t } = useTranslation(['common', 'terms']);
  const { breakpoint } = useDevice();
  const { ready, destinations } = useDestinations();
  const {
    operator: { operator, currentUser },
  } = useOperatorContext();
  const focused = state.routes[state.index]?.name;
  const items = barItems(destinations);
  const variant =
    breakpoint === 'compact' ? 'bottom' : breakpoint === 'medium' ? 'rail' : 'sidebar';

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

  const open = React.useCallback(
    (destination: (typeof items)[number]) => {
      const { tab } = destination.route;
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
  const openDrawer = React.useCallback(
    () => navigation.dispatch(DrawerActions.openDrawer()),
    [navigation]
  );

  if (!ready) return null;

  const list = items.map((destination) => (
    <NavItem
      key={destination.key}
      testID={`nav-${destination.key}`}
      label={t(destination.labelKey)}
      icon={destination.icon}
      active={destination.route.tab === focused}
      variant={variant}
      onPress={() => open(destination)}
    />
  ));

  if (variant === 'bottom') {
    return (
      <View role="navigation" aria-label={t('navigation.main')} style={styles.bottom}>
        {list}
      </View>
    );
  }

  if (variant === 'rail') {
    return (
      <View role="navigation" aria-label={t('navigation.main')} style={styles.rail}>
        {list}
        <View style={styles.spacer} />
      </View>
    );
  }

  return (
    <View role="navigation" aria-label={t('navigation.main')} style={styles.sidebar}>
      <Tappable role="button" aria-label={t('navigation.switchOperator')} onPress={openDrawer}>
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
        onPress={openDrawer}
        style={styles.account}
      >
        <Text numberOfLines={1} style={styles.accountName}>
          {currentUser?.user?.name ?? t('destinations.account')}
        </Text>
      </Tappable>
    </View>
  );
}
