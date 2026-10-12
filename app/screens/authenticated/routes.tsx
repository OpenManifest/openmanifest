import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, Text } from 'react-native';

import { Permission } from 'app/api/schema.d';
import guarded from 'app/navigation/AccessGuard';
import { decide, type AccessRule } from 'app/navigation/destinations';
import { useAccess } from 'app/navigation/useDestinations';

import { useTheme } from 'react-native-paper';

import { NavigatorScreenParams } from '@react-navigation/native';
import { AppSignalBoundary } from 'app/components/app_signal';
import ManifestTab, { OperatorRoutes } from './manifest/routes';
import UsersTab, { UserRoutes } from './user/routes';
import NotificationsTab, { NotificationRoutes } from './notifications/routes';
import OverviewTab, { OverviewRoutes } from './overview/routes';

import BottomTab from './TabBar';
import { useAppTheme } from 'app/theme';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';

export type AuthenticatedRoutes = {
  Manifest: NavigatorScreenParams<OperatorRoutes>;
  Overview: NavigatorScreenParams<OverviewRoutes>;
  Users: NavigatorScreenParams<UserRoutes>;
  Notifications: NavigatorScreenParams<NotificationRoutes>;
};

// A tab the user may not use stays registered but has no button in the bar
const hiddenTabButton = () => null;

const USERS_RULE: AccessRule = { permission: Permission.ReadUser };
// The dashboard is for those who may see the statistics, and the platform overview for moderators
const OVERVIEW_RULE: AccessRule = {
  any: [{ permission: Permission.ViewStatistics }, { moderator: true }],
};
const GuardedOverview = guarded(OverviewTab, OVERVIEW_RULE);
const GuardedUsers = guarded(UsersTab, USERS_RULE);

export default function AuthenticatedTabBar() {
  const { t } = useTranslation('common');
  const { palette } = useAppTheme();

  // Every tab is registered whatever the permissions are (a link to /users must find its route on a cold load); the
  // ones the user may not use are hidden from the bar and their screens say so
  const { ready, access } = useAccess();
  const showsOverview = ready && decide(OVERVIEW_RULE, access) === 'allowed';
  const showsUsers = ready && decide(USERS_RULE, access) === 'allowed';

  const theme = useTheme();

  const screenOptions = React.useMemo(
    () => ({
      tabBarActiveTintColor: '#FFFFFF',
      tabBarActiveBackgroundColor: palette.primary.main,
      tabBarInactiveTintColor: palette.primary.main,
      tabBarInactiveBackgroundColor: theme.dark ? theme.colors.backdrop : theme.colors.surface,
      tabBarShowLabel: Platform.OS !== 'web',
      tabBarLabel: ({ children, color }: { children: string; color: string }) => (
        <Text
          maxFontSizeMultiplier={CHROME_MAX_FONT_SIZE_MULTIPLIER}
          numberOfLines={1}
          style={[styles.tabLabel, { color }]}
        >
          {children}
        </Text>
      ),
      headerShown: false,
      tabBarStyle: {
        backgroundColor: theme.dark ? theme.colors.background : '#FFFFFF',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#CCCCCC',
      },
    }),
    [
      palette.primary.main,
      theme.colors.backdrop,
      theme.colors.background,
      theme.colors.surface,
      theme.dark,
    ]
  );

  return (
    <AppSignalBoundary>
      <BottomTab.Navigator initialRouteName="Manifest" {...{ screenOptions }}>
        <BottomTab.Screen
          name="Overview"
          component={GuardedOverview}
          options={{
            title: t('tabs.overview'),
            tabBarButton: showsOverview ? undefined : hiddenTabButton,
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons
                name="view-dashboard-outline"
                {...{ size, color }}
                style={[styles.icon, focused ? styles.iconActive : undefined]}
              />
            ),
          }}
        />
        <BottomTab.Screen
          name="Manifest"
          component={ManifestTab}
          options={{
            title: t('tabs.manifest'),
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons
                name="airplane"
                {...{ size, color }}
                style={[styles.icon, focused ? styles.iconActive : undefined]}
              />
            ),
          }}
        />
        <BottomTab.Screen
          name="Notifications"
          component={NotificationsTab}
          options={{
            title: t('tabs.notifications'),
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons
                name="bell-outline"
                style={[styles.icon, focused ? styles.iconActive : undefined]}
                {...{ size, color }}
              />
            ),
            popToTopOnBlur: true,
          }}
        />
        <BottomTab.Screen
          name="Users"
          component={GuardedUsers}
          options={{
            title: t('tabs.users'),
            tabBarButton: showsUsers ? undefined : hiddenTabButton,
            tabBarIcon: ({ size, color, focused }) => (
              <MaterialCommunityIcons
                {...{ size, color }}
                name="account-group-outline"
                style={[styles.icon, focused ? styles.iconActive : undefined]}
              />
            ),
            popToTopOnBlur: true,
          }}
        />
      </BottomTab.Navigator>
    </AppSignalBoundary>
  );
}

const styles = StyleSheet.create({
  tabLabel: { fontSize: 10, textAlign: 'center' },
  icon: {
    opacity: 0.75,
  },
  iconActive: {
    opacity: 1.0,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});
