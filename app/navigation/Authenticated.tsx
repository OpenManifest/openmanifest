import { useTheme } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';

import { StyleSheet, Text } from 'react-native';
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

export default function AuthenticatedTabBar() {
  const theme = useTheme();

  const canViewUsers = useRestriction(Permission.ReadUser);

  return (
    <BottomTab.Navigator
      initialRouteName="Manifest"
      tabBarOptions={{
        activeTintColor: '#FFFFFF',
        inactiveBackgroundColor: theme.colors.primary,
        activeBackgroundColor: theme.colors.primary,
        inactiveTintColor: '#CCCCCC',
        showLabel: true,
        style: {
          backgroundColor: theme.colors.primary,
        },
      }}
    >
      <BottomTab.Screen
        name="Manifest"
        component={ManifestTab}
        options={{
          tabBarLabel: ({ focused }) =>
            !focused ? null : <Text style={styles.label}>Manifest</Text>,
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name="airplane"
              {...{ color, size }}
              style={[styles.icon, focused ? styles.iconActive : undefined]}
            />
          ),
          unmountOnBlur: true,
        }}
      />
      <BottomTab.Screen
        name="Notifications"
        component={NotificationsTab}
        options={{
          tabBarLabel: ({ focused }) =>
            !focused ? null : <Text style={styles.label}>Notifications</Text>,
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
              name="bell"
              style={[styles.icon, focused ? styles.iconActive : undefined]}
              {...{ color, size }}
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
            tabBarLabel: ({ focused }) =>
              !focused ? null : <Text style={styles.label}>Users</Text>,
            tabBarIcon: ({ size, color, focused }) => (
              <MaterialCommunityIcons
                {...{ size, color }}
                name="account-group"
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
    color: '#FFFFFF',
  },
  iconActive: {
    opacity: 1.0,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 10,
  },
});
