import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, View } from 'react-native';
import { useIsFocused, type NavigatorScreenParams } from '@react-navigation/native';

import { Permission } from 'app/api/schema.d';
import { AppSignalBoundary } from 'app/components/app_signal';
import AppNavigation, { tabBarPositionFor } from 'app/navigation/AppNavigation';
import SkipLink from 'app/navigation/SkipLink';
import guarded from 'app/navigation/AccessGuard';
import useRestriction from 'app/hooks/useRestriction';
import type { AccessRule } from 'app/navigation/destinations';
import { useDevice } from 'app/ui';
import ManifestTab, { OperatorRoutes } from './manifest/routes';
import UsersTab, { UserRoutes } from './user/routes';
import NotificationsTab, { NotificationRoutes } from './notifications/routes';
import OverviewTab, { OverviewRoutes } from './overview/routes';
import TodayTab, { TodayRoutes } from './today/routes';
import WalletTab, { WalletRoutes } from './wallet/routes';
import AccountScreen from './account/AccountScreen';
import MoreScreen from './account/MoreScreen';

import BottomTab from './TabBar';

export type AuthenticatedRoutes = {
  Today: NavigatorScreenParams<TodayRoutes>;
  Wallet: NavigatorScreenParams<WalletRoutes>;
  Manifest: NavigatorScreenParams<OperatorRoutes>;
  Overview: NavigatorScreenParams<OverviewRoutes>;
  Users: NavigatorScreenParams<UserRoutes>;
  Notifications: NavigatorScreenParams<NotificationRoutes>;
  More: undefined;
  Account: undefined;
};

// The dashboard is for those who may see the statistics, and the platform overview for moderators
const OVERVIEW_RULE: AccessRule = {
  any: [{ permission: Permission.ViewStatistics }, { moderator: true }],
};

/**
 * The content of a tab is the `<main>` landmark of the page (the skip link of the navigation jumps to it). The screens of
 * the other tabs stay mounted underneath, covered: on the web they are made `inert`, or the keyboard and screen readers
 * would reach their controls (hiding them would lose their scroll position).
 */
function inMain<Props extends object>(
  Screen: React.ComponentType<Props>
): React.ComponentType<Props> {
  function Main(props: Props) {
    const focused = useIsFocused();
    const ref = React.useRef<View>(null);

    React.useEffect(() => {
      if (Platform.OS !== 'web') return;
      const node = ref.current as unknown as HTMLElement | null;
      if (focused) node?.removeAttribute('inert');
      else node?.setAttribute('inert', '');
    }, [focused]);

    return (
      <View ref={ref} role="main" tabIndex={-1} style={{ flex: 1 }}>
        <Screen {...props} />
      </View>
    );
  }
  Main.displayName = `Main(${Screen.displayName || Screen.name || 'Screen'})`;
  return Main;
}

// Every tab is registered whatever the permissions are (a link to /users must find its route on a cold load): the bar is
// made from the destinations the user may use, and the screens of the others say so
const OverviewScreen = inMain(guarded(OverviewTab, OVERVIEW_RULE));
const UsersScreen = inMain(UsersTab);
const TodayScreen = inMain(TodayTab);
const WalletScreen = inMain(WalletTab);
const ManifestScreen = inMain(ManifestTab);
const NotificationsScreen = inMain(NotificationsTab);
const MoreTab = inMain(MoreScreen);
const AccountTab = inMain(AccountScreen);

export default function AuthenticatedTabBar() {
  const { t } = useTranslation('common');
  const { breakpoint } = useDevice();
  // Those who do not manifest other people land on their day; the manifest desk lands on the board
  const landsOnToday = !useRestriction(Permission.CreateUserSlot);

  const screenOptions = React.useMemo(
    () => ({ headerShown: false, tabBarPosition: tabBarPositionFor(breakpoint) }),
    [breakpoint]
  );
  const tabBar = React.useCallback(
    (props: React.ComponentProps<typeof AppNavigation>) => <AppNavigation {...props} />,
    []
  );

  return (
    <AppSignalBoundary>
      {/* The first stop of the keyboard, before the bar and the screen */}
      {Platform.OS === 'web' ? <SkipLink /> : null}
      <BottomTab.Navigator
        initialRouteName={landsOnToday ? 'Today' : 'Manifest'}
        screenOptions={screenOptions}
        tabBar={tabBar}
      >
        <BottomTab.Screen
          name="Today"
          component={TodayScreen}
          options={{ title: t('destinations.today') }}
        />
        <BottomTab.Screen
          name="Overview"
          component={OverviewScreen}
          options={{ title: t('destinations.reports') }}
        />
        <BottomTab.Screen
          name="Manifest"
          component={ManifestScreen}
          options={{ title: t('destinations.board') }}
        />
        <BottomTab.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ title: t('destinations.inbox'), popToTopOnBlur: true }}
        />
        <BottomTab.Screen
          name="Wallet"
          component={WalletScreen}
          options={{ title: t('destinations.wallet'), popToTopOnBlur: true }}
        />
        <BottomTab.Screen
          name="Users"
          component={UsersScreen}
          options={{ title: t('destinations.people'), popToTopOnBlur: true }}
        />
        <BottomTab.Screen
          name="More"
          component={MoreTab}
          options={{ title: t('destinations.more') }}
        />
        <BottomTab.Screen
          name="Account"
          component={AccountTab}
          options={{ title: t('destinations.account') }}
        />
      </BottomTab.Navigator>
    </AppSignalBoundary>
  );
}
