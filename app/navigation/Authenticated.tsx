import { useTheme } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { Appearance, StyleSheet, Text } from 'react-native';
import AnimatedTabBar, { TabsConfig, BubbleTabBarItemConfig } from '@gorhom/animated-tabbar';
import Animated from 'react-native-reanimated';
import color from 'color';

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
  const theme = useTheme();
  const isDarkMode = Appearance.getColorScheme() === 'dark';

  const canViewUsers = useRestriction(Permission.ReadUser);

  const primaryLight = color(theme.colors.primary).lighten(0.6).hex();

  const tabs: TabsConfig<BubbleTabBarItemConfig> = React.useMemo(
    () => ({
      Manifest: {
        labelStyle: {
          color: color(theme.colors.primary).darken(0.3).hex(),
        },
        icon: {
          component: ({ animatedFocus, size }) => (
            <MaterialCommunityIcons
              name="airplane"
              color={color(theme.colors.primary).darken(0.3).hex()}
              style={[styles.icon, animatedFocus ? styles.iconActive : undefined]}
              {...{ size }}
            />
          ),
          activeColor: theme.colors.accent,
          inactiveColor: theme.colors.primary,
        },
        background: {
          activeColor: primaryLight,
          inactiveColor: theme.colors.surface,
        },
      },
      Notifications: {
        labelStyle: {
          color: color(theme.colors.primary).darken(0.3).hex(),
        },
        icon: {
          component: ({ animatedFocus, size }) => (
            <MaterialCommunityIcons
              name="bell-outline"
              color={color(theme.colors.primary).darken(0.3).hex()}
              style={[styles.icon, animatedFocus ? styles.iconActive : undefined]}
              {...{ size }}
            />
          ),
          activeColor: theme.colors.accent,
          inactiveColor: theme.colors.primary,
        },
        background: {
          activeColor: primaryLight,
          inactiveColor: theme.colors.surface,
        },
      },
      Users: {
        labelStyle: {
          color: color(theme.colors.primary).darken(0.3).hex(),
        },
        icon: {
          component: ({ animatedFocus, size }) => (
            <AnimatedIcon
              name="account-group-outline"
              color={color(theme.colors.primary).darken(0.3).hex()}
              style={[styles.icon, animatedFocus ? styles.iconActive : undefined]}
              {...{ size }}
            />
          ),
          activeColor: theme.colors.accent,
          inactiveColor: theme.colors.primary,
        },
        background: {
          activeColor: primaryLight,
          inactiveColor: theme.colors.surface,
        },
      },
    }),
    [primaryLight, theme.colors.accent, theme.colors.primary, theme.colors.surface]
  );

  return (
    <BottomTab.Navigator
      initialRouteName="Manifest"
      tabBar={(props) => (
        <AnimatedTabBar
          preset="bubble"
          tabs={tabs}
          animation="iconWithLabelOnFocus"
          inactiveOpacity={0.25}
          inactiveScale={0.5}
          tabs={tabs}
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
          // backgroundColor: theme.dark ? theme.colors.backdrop : theme.colors.primary,
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
