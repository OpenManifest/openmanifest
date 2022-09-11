import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { Appearance, Platform, StyleSheet } from 'react-native';

import { useAppSelector } from 'app/state';
import useRestriction from 'app/hooks/useRestriction';
import { Permission } from 'app/api/schema.d';

import { useTheme } from 'react-native-paper';

import { NavigatorScreenParams } from '@react-navigation/core';
import ManifestTab, { DropzoneRoutes } from './dropzone/routes';
import UsersTab, { UserRoutes } from './user/routes';
import NotificationsTab, { NotificationRoutes } from './notifications/routes';
import OverviewTab, { OverviewRoutes } from './overview/routes';

import BottomTab from './TabBar';

export type AuthenticatedRoutes = {
  Manifest: NavigatorScreenParams<DropzoneRoutes>;
  Overview: NavigatorScreenParams<OverviewRoutes>;
  Users: NavigatorScreenParams<UserRoutes>;
  Notifications: NavigatorScreenParams<NotificationRoutes>;
};

export default function AuthenticatedTabBar() {
  const { palette } = useAppSelector((root) => root.global);
  const isDarkMode = Appearance.getColorScheme() === 'dark';

  const canViewUsers = useRestriction(Permission.ReadUser);
  const canViewDashboard = useRestriction(Permission.ViewStatistics);
  const theme = useTheme();

  console.debug({ isDarkMode, dark: theme.dark });

  const screenOptions = React.useMemo(
    () => ({
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveBackgroundColor: theme.dark ? theme.colors.backdrop : theme.colors.surface,
      tabBarActiveBackgroundColor: theme.colors.surface,
      tabBarInactiveTintColor: '#CCCCCC',
      tabBarShowLabel: Platform.OS !== 'web',
      headerShown: false,
      tabBarStyle: {
        backgroundColor: theme.dark ? theme.colors.background : '#FFFFFF',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#CCCCCC',
      },
    }),
    [
      theme.colors.backdrop,
      theme.colors.background,
      theme.colors.primary,
      theme.colors.surface,
      theme.dark,
    ]
  );

  return (
    <BottomTab.Navigator
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      appearance={{
        tabBarBackground: theme.colors.surface,
        topPadding: 16,
        shadow: true,
        bottomPadding: 16,
      }}
      tabBarOptions={{
        activeTintColor: '#FFFFFF',
        inactiveTintColor: palette.primary.main,
        activeBackgroundColor: palette.primary.main,
      }}
      initialRouteName="Manifest"
      {...{ screenOptions }}
    >
      {canViewDashboard && (
        <BottomTab.Screen
          name="Overview"
          component={OverviewTab}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons
                name="view-dashboard-outline"
                {...{ size, color }}
                style={[styles.icon, focused ? styles.iconActive : undefined]}
              />
            ),
            unmountOnBlur: false,
          }}
        />
      )}
      <BottomTab.Screen
        name="Manifest"
        component={ManifestTab}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name="airplane"
              {...{ size, color }}
              style={[styles.icon, focused ? styles.iconActive : undefined]}
            />
          ),
          unmountOnBlur: false,
        }}
      />
      <BottomTab.Screen
        name="Notifications"
        component={NotificationsTab}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name="bell-outline"
              style={[styles.icon, focused ? styles.iconActive : undefined]}
              {...{ size, color }}
            />
          ),
          unmountOnBlur: true,
        }}
      />
      {canViewUsers && (
        <BottomTab.Screen
          name="Users"
          component={UsersTab}
          options={{
            tabBarIcon: ({ size, color, focused }) => (
              <MaterialCommunityIcons
                {...{ size, color }}
                name="account-group-outline"
                style={[styles.icon, focused ? styles.iconActive : undefined]}
              />
            ),
            unmountOnBlur: true,
          }}
        />
      )}
    </BottomTab.Navigator>
  );
}

const styles = StyleSheet.create({
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
