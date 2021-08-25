import {
  BottomTabBarOptions,
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { Appearance, Platform, StyleSheet, Text } from 'react-native';
import type { TabsConfig, BubbleTabBarItemConfig } from '@gorhom/animated-tabbar';
import Animated from 'react-native-reanimated';

import { useAppSelector } from '../state';
import ManifestTab from './tabs/manifest';
import UsersTab from './tabs/users';
import NotificationsTab from './tabs/notifications';

import useRestriction from '../hooks/useRestriction';
import { Permission } from '../api/schema.d';

import AnimatedTabBar from './AnimatedTabBar';

export type IAuthenticatedTabParams = {
  Manifest: undefined;
  Profile: undefined;
  Packing: undefined;
  Users: undefined;
  Notifications: undefined;
  Settings: undefined;
};

const BottomTab = createBottomTabNavigator<IAuthenticatedTabParams>();

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);
export default function AuthenticatedTabBar() {
  const { theme, palette } = useAppSelector((root) => root.global);
  const isDarkMode = Appearance.getColorScheme() === 'dark';

  const canViewUsers = useRestriction(Permission.ReadUser);

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
        activeColor: palette.primary.main,
        inactiveColor: theme.colors.surface,
      },
    }),
    [
      palette.primary.dark,
      palette.primary.main,
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

  return (
    <BottomTab.Navigator
      initialRouteName="Manifest"
      {...Platform.select({
        web: {},
        ios: {
          tabBar: (props: BottomTabBarProps<BottomTabBarOptions>) => (
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
        android: {
          tabBar: (props: BottomTabBarProps<BottomTabBarOptions>) => (
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
      })}
      tabBarOptions={{
        activeTintColor: '#FFFFFF',
        inactiveBackgroundColor: theme.dark ? theme.colors.backdrop : theme.colors.primary,
        activeBackgroundColor: theme.dark ? theme.colors.surface : theme.colors.primary,
        inactiveTintColor: '#CCCCCC',
        showLabel: Platform.OS !== 'web',
        adaptive: true,
        style: {
          backgroundColor: theme.dark ? theme.colors.background : '#FFFFFF',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: '#CCCCCC',
        },
      }}
    >
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
              style={[styles.icon, focused ? styles.iconActive : undefined]}
              {...{ size }}
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
                {...{ size }}
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
