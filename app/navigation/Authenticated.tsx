import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { Appearance, StyleSheet, Text } from 'react-native';
import AnimatedTabBar, { TabsConfig, BubbleTabBarItemConfig } from '@gorhom/animated-tabbar';
import Animated from 'react-native-reanimated';
import c from 'color';

import { useAppSelector } from '../state';
import ManifestTab from './tabs/manifest';
import UsersTab from './tabs/users';
import NotificationsTab from './tabs/notifications';

import useRestriction from '../hooks/useRestriction';
import { Permission } from '../api/schema.d';

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

  const primaryLight = c(theme.colors.primary).lighten(0.6).hex();

  const tabs: TabsConfig<BubbleTabBarItemConfig> = React.useMemo(
    () => ({
      Manifest: {
        labelStyle: {
          color: theme.dark ? theme.colors.onSurface : palette.primary.dark,
        },
        icon: {
          component: ({ animatedFocus, size }) => (
            <MaterialCommunityIcons
              name="airplane"
              color={theme.dark ? theme.colors.onSurface : palette.primary.dark}
              style={[styles.icon, animatedFocus ? styles.iconActive : undefined]}
              {...{ size }}
            />
          ),
          activeColor: theme.colors.accent,
          inactiveColor: theme.colors.primary,
        },
        background: {
          activeColor: theme.dark ? palette.primary.dark : primaryLight,
          inactiveColor: theme.colors.surface,
        },
      },
      Notifications: {
        labelStyle: {
          color: theme.dark ? theme.colors.onSurface : palette.primary.dark,
        },
        icon: {
          component: ({ animatedFocus, size }) => (
            <MaterialCommunityIcons
              name="bell-outline"
              color={theme.dark ? theme.colors.onSurface : palette.primary.dark}
              style={[styles.icon, animatedFocus ? styles.iconActive : undefined]}
              {...{ size }}
            />
          ),
          activeColor: theme.colors.accent,
          inactiveColor: theme.colors.primary,
        },
        background: {
          activeColor: theme.dark ? palette.primary.dark : primaryLight,
          inactiveColor: theme.colors.surface,
        },
      },
      Users: {
        labelStyle: {
          color: theme.dark ? theme.colors.onSurface : palette.primary.dark,
        },
        icon: {
          component: ({ animatedFocus, size }) => (
            <AnimatedIcon
              name="account-group-outline"
              color={theme.dark ? theme.colors.onSurface : palette.primary.dark}
              style={[styles.icon, animatedFocus ? styles.iconActive : undefined]}
              {...{ size }}
            />
          ),
          activeColor: theme.colors.accent,
          inactiveColor: theme.colors.primary,
        },
        background: {
          activeColor: theme.dark ? palette.primary.dark : primaryLight,
          inactiveColor: theme.colors.surface,
        },
      },
    }),
    [
      palette.primary.dark,
      primaryLight,
      theme.colors.accent,
      theme.colors.onSurface,
      theme.colors.primary,
      theme.colors.surface,
      theme.dark,
    ]
  );

  return (
    <BottomTab.Navigator
      initialRouteName="Manifest"
      tabBar={(props) => (
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
      )}
      tabBarOptions={{
        activeTintColor: '#FFFFFF',
        inactiveBackgroundColor: theme.dark ? theme.colors.backdrop : theme.colors.primary,
        activeBackgroundColor: theme.dark ? theme.colors.surface : theme.colors.primary,
        inactiveTintColor: '#CCCCCC',
        showLabel: true,
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
