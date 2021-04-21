import { useTheme } from 'react-native-paper';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';

import ManifestTab from "./tabs/manifest";
import PackingTab from "./tabs/packing";
import ProfileTab from "./tabs/profile";
import SettingsTab from "./tabs/settings";
import UsersTab from "./tabs/users";

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import useRestriction from '../hooks/useRestriction';

export type IAuthenticatedTabParams = {
  Manifest: undefined;
  Profile: undefined;
  Packing: undefined;
  Users: undefined;
  Settings: undefined;
}

function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

const BottomTab = createMaterialBottomTabNavigator<IAuthenticatedTabParams>();

export default function AuthenticatedTabBar() {
  const theme = useTheme();

  const canViewUsers = useRestriction("readUser");
  const canCreatePacks = useRestriction("createPackjob");
  const canManageDropzone = useRestriction("updateDropzone");
  
  return (
    <BottomTab.Navigator
      initialRouteName="Manifest"
    >
      <BottomTab.Screen
        name="Manifest"
        component={ManifestTab}
        options={{
          tabBarIcon: "airplane"
        }}
      />
      <BottomTab.Screen
        name="Profile"
        component={ProfileTab}
        options={{
          tabBarIcon: "account-circle"
        }}
      />
      { canCreatePacks && (
        <BottomTab.Screen
          name="Packing"
          component={PackingTab}
          options={{
            tabBarIcon: "parachute"
          }}
        />
      )}
      { canViewUsers && (
        <BottomTab.Screen
          name="Users"
          component={UsersTab}
          options={{
            tabBarIcon: "account-group"
          }}
        />
      )}
      
      { canManageDropzone && (
        <BottomTab.Screen
          name="Settings"
          component={SettingsTab}
          options={{
            tabBarIcon: "account-cog"
          }}
        />
      )}
    </BottomTab.Navigator>
  );
}

