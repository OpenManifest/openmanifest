import { BottomNavigation, useTheme } from 'react-native-paper';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import ManifestTab from "./tabs/manifest";
import PackingTab from "./tabs/packing";
import ProfileTab from "./tabs/profile";
import SettingsTab from "./tabs/settings";
import UsersTab from "./tabs/users";

import useColorScheme from '../hooks/useColorScheme';
import useRestriction from '../hooks/useRestriction';

export type IAuthenticatedTabParams = {
  Manifest: undefined;
  Profile: undefined;
  Packing: undefined;
  Users: undefined;
  Settings: undefined;
}


const BottomTab = createBottomTabNavigator<IAuthenticatedTabParams>();

export default function AuthenticatedTabBar() {
  const theme = useTheme();

  const canViewUsers = useRestriction("readUser");
  const canCreatePacks = useRestriction("createPackjob");
  const canManageDropzone = useRestriction("updateDropzone");
  
  return (
    <BottomTab.Navigator
      initialRouteName="Manifest"
      tabBarOptions={{
        activeTintColor: "#FFFFFF",
        inactiveBackgroundColor: theme.colors.primary,
        activeBackgroundColor: theme.colors.primary,
        inactiveTintColor: "#CCCCCC",
        showLabel: false,
      }}
    >
      <BottomTab.Screen
        name="Manifest"
        component={ManifestTab}
        options={{
          tabBarIcon: ({ focused, color, size }) => <MaterialCommunityIcons name="airplane" color={color} size={size} />,
          unmountOnBlur: true,
        }}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfileTab}
        options={{
          tabBarIcon: ({ size, color, focused }) => <MaterialCommunityIcons {...{size, color }} name="account-circle" />,
          unmountOnBlur: true,
        }}
      />
      { false && canCreatePacks && (
        <BottomTab.Screen
          name="Packing"
          component={PackingTab}
          options={{
            tabBarIcon: ({ size, color, focused }) => <MaterialCommunityIcons {...{size, color }} name="parachute" />,
            unmountOnBlur: true,
          }}
        />
      )}
      { canViewUsers && (
        <BottomTab.Screen
          name="Users"
          component={UsersTab}
          options={{
            tabBarIcon: ({ size, color, focused }) => <MaterialCommunityIcons {...{size, color }} name="account-group" />,
            unmountOnBlur: true,
          }}
        />
      )}
      
      { canManageDropzone && (
        <BottomTab.Screen
          name="Settings"
          component={SettingsTab}
          options={{
            tabBarIcon: ({ size, color, focused }) => <MaterialCommunityIcons {...{size, color }} name="account-cog" />
          }}
        />
      )}
    </BottomTab.Navigator>
  );
}

