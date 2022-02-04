import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { Appearance, Platform, StyleSheet, Text } from 'react-native';
import type { TabsConfig, BubbleTabBarItemConfig } from '@gorhom/animated-tabbar';
import Animated from 'react-native-reanimated';

import { useAppSelector } from 'app/state';
import useRestriction from 'app/hooks/useRestriction';
import { Permission } from 'app/api/schema.d';
import AnimatedTabBar from 'app/components/bottom_tabs/AnimatedTabBar';
import { useTheme } from 'react-native-paper';

import { NavigatorScreenParams } from '@react-navigation/core';
import ManifestTab, { DropzoneRoutes } from './dropzone/routes';
import UsersTab, { UserRoutes } from './user/routes';
import NotificationsTab, { NotificationRoutes } from './notifications/routes';

export type AuthenticatedRoutes = {
  Manifest: NavigatorScreenParams<DropzoneRoutes>;
  Users: NavigatorScreenParams<UserRoutes>;
  Notifications: NavigatorScreenParams<NotificationRoutes>;
};

const BottomTab = createBottomTabNavigator<AuthenticatedRoutes>();
const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

export default function AuthenticatedTabBar() {
  const { palette } = useAppSelector((root) => root.global);
  const isDarkMode = Appearance.getColorScheme() === 'dark';

  const canViewUsers = useRestriction(Permission.ReadUser);
  const theme = useTheme();

  const tabConfig = React.useMemo(
    () => ({
      labelStyle: {
        color: theme.dark ? theme.colors.onSurface : palette.surface,
      },
      icon: {
        activeColor: palette.surface,
        inactiveColor: palette.primary.dark,
      },
      background: {
        // activeColor: palette.primary.main,
        activeColor: palette.placeholder,
        inactiveColor: theme.colors.surface,
      },
    }),
    [
      palette.placeholder,
      palette.primary.dark,
      palette.surface,
      theme.colors.onSurface,
      theme.colors.surface,
      theme.dark,
    ]
  );
  const tabs: TabsConfig<BubbleTabBarItemConfig> = React.useMemo(
    () => ({
      Manifest: {
        ...tabConfig,
        icon: {
          ...tabConfig.icon,
          component: ({ animatedFocus, size, color }) => (
            <AnimatedIcon
              name="airplane"
              style={[styles.icon, animatedFocus ? styles.iconActive : undefined]}
              {...{ size, color: color as unknown as string }}
            />
          ),
        },
      },
      Notifications: {
        ...tabConfig,
        icon: {
          ...tabConfig.icon,
          component: ({ animatedFocus, size, color }) => (
            <AnimatedIcon
              name="bell-outline"
              style={[styles.icon, animatedFocus ? styles.iconActive : undefined]}
              {...{ size, color: color as unknown as string }}
            />
          ),
        },
      },
      Users: {
        ...tabConfig,
        icon: {
          ...tabConfig.icon,
          component: ({ animatedFocus, size, color }) => (
            <AnimatedIcon
              name="account-group-outline"
              style={[styles.icon, animatedFocus ? styles.iconActive : undefined]}
              {...{ size, color: color as unknown as string }}
            />
          ),
        },
      },
    }),
    [tabConfig]
  );

  const tabBarProps = React.useMemo(
    () =>
      Platform.select({
        web: {},
        ios: {
          tabBar: (props: BottomTabBarProps) => (
            <AnimatedTabBar
              preset="bubble"
              tabs={tabs}
              style={{
                borderTopColor: 'gray',
                borderTopWidth: StyleSheet.hairlineWidth,
                backgroundColor: theme.colors.background,
              }}
              {...props}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              animation="iconWithLabelOnFocus"
              inactiveOpacity={0.25}
              inactiveScale={0.5}
              {...props}
            />
          ),
        },
        android: {
          tabBar: (props: BottomTabBarProps) => (
            <AnimatedTabBar
              preset="bubble"
              tabs={tabs}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              animation="iconWithLabelOnFocus"
              inactiveOpacity={0.25}
              inactiveScale={0.5}
              {...props}
            />
          ),
        },
      }),
    [tabs, theme.colors.background]
  );

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
    <BottomTab.Navigator initialRouteName="Manifest" {...tabBarProps} {...{ screenOptions }}>
      <BottomTab.Screen
        name="Manifest"
        component={ManifestTab}
        options={{
          tabBarLabel: ({ focused, color }) =>
            !focused ? null : (
              <Text
                style={[
                  styles.label,
                  { color: isDarkMode && focused ? theme.colors.primary : color },
                ]}
              >
                Manifest
              </Text>
            ),
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name="airplane"
              {...{ size }}
              style={[styles.icon, focused ? styles.iconActive : undefined]}
              color={isDarkMode && focused ? theme.colors.primary : color}
            />
          ),
          unmountOnBlur: false,
        }}
      />
      <BottomTab.Screen
        name="Notifications"
        component={NotificationsTab}
        options={{
          tabBarLabel: ({ focused, color }) =>
            !focused ? null : (
              <Text
                style={[
                  styles.label,
                  { color: isDarkMode && focused ? theme.colors.primary : color },
                ]}
              >
                Notifications
              </Text>
            ),
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name="bell"
              style={[styles.icon, focused ? styles.iconActive : undefined]}
              {...{ size }}
              color={isDarkMode && focused ? theme.colors.primary : color}
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
            tabBarLabel: ({ focused, color }) =>
              !focused ? null : (
                <Text
                  style={[
                    styles.label,
                    { color: isDarkMode && focused ? theme.colors.primary : color },
                  ]}
                >
                  Users
                </Text>
              ),
            tabBarIcon: ({ size, color, focused }) => (
              <MaterialCommunityIcons
                {...{ size, color }}
                name="account-group"
                style={[styles.icon, focused ? styles.iconActive : undefined]}
                color={isDarkMode && focused ? theme.colors.primary : color}
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
