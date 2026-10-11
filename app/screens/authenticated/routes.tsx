import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { useAppSelector } from 'app/state';
import useRestriction from 'app/hooks/useRestriction';
import { ModerationRole, Permission } from 'app/api/schema.d';

import { useTheme } from 'react-native-paper';

import { NavigatorScreenParams } from '@react-navigation/native';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { AppSignalBoundary } from 'app/components/app_signal';
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

  const {
    dropzone: { currentUser }
  } = useDropzoneContext();
  const isAdmin = currentUser?.user?.moderationRole !== ModerationRole.User;
  const canViewUsers = useRestriction(Permission.ReadUser);
  const canViewDashboard = useRestriction(Permission.ViewStatistics);

  const theme = useTheme();

  const screenOptions = React.useMemo(
    () => ({
      tabBarActiveTintColor: '#FFFFFF',
      tabBarActiveBackgroundColor: palette.primary.main,
      tabBarInactiveTintColor: palette.primary.main,
      tabBarInactiveBackgroundColor: theme.dark ? theme.colors.backdrop : theme.colors.surface,
      tabBarShowLabel: Platform.OS !== 'web',
      headerShown: false,
      tabBarStyle: {
        backgroundColor: theme.dark ? theme.colors.background : '#FFFFFF',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#CCCCCC'
      }
    }),
    [palette.primary.main, theme.colors.backdrop, theme.colors.background, theme.colors.surface, theme.dark]
  );

  return (
    <AppSignalBoundary>
      <BottomTab.Navigator
        initialRouteName="Manifest"
        {...{ screenOptions }}
      >
        {(canViewDashboard || isAdmin) && (
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
              )
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
            )
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
            popToTopOnBlur: true
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
              popToTopOnBlur: true
            }}
          />
        )}
      </BottomTab.Navigator>
    </AppSignalBoundary>
  );
}

const styles = StyleSheet.create({
  icon: {
    opacity: 0.75
  },
  iconActive: {
    opacity: 1.0
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12
  }
});
