import { useTheme } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';

import { StyleSheet } from 'react-native';
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
        showLabel: false,
        style: {
          backgroundColor: theme.colors.primary,
        },
      }}
    >
      <BottomTab.Screen
        name="Manifest"
        component={ManifestTab}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons name="airplane" {...{ color, size }} style={styles.icon} />
          ),
          unmountOnBlur: true,
        }}
      />
      <BottomTab.Screen
        name="Notifications"
        component={NotificationsTab}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons name="bell" {...{ color, size }} style={styles.icon} />
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
                name="account-group"
                style={styles.icon}
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
    textShadowColor: '#000000',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 1,
  },
});
