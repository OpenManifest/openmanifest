import { useTheme } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';

import ManifestTab from "./tabs/manifest";
import NotificationTab from "./tabs/notifications";
import ProfileTab from "./tabs/profile";
import SettingsTab from "./tabs/settings";
import UsersTab from "./tabs/users";

import useRestriction from '../hooks/useRestriction';
import { Permission } from '../api/schema.d';

export type IAuthenticatedTabParams = {
  Manifest: undefined;
  Profile: undefined;
  Packing: undefined;
  Users: undefined;
  Notifications: undefined;
  Settings: undefined;
}


const BottomTab = createBottomTabNavigator<IAuthenticatedTabParams>();

export default function AuthenticatedTabBar() {
  const theme = useTheme();

  const canViewUsers = useRestriction(Permission.ReadUser);

  const canUpdateDropzone = useRestriction(Permission.UpdateDropzone);
  const canUpdatePlane = useRestriction(Permission.UpdatePlane);
  const canUpdateTicketTypes = useRestriction(Permission.UpdateTicketType);
  const canUpdateExtras = useRestriction(Permission.UpdateExtra);
  const canUpdatePermissions = useRestriction(Permission.GrantPermission);
  const canUpdateDzRigs = useRestriction(Permission.UpdateDropzoneRig);
  const canUpdateRigInspectionTemplate = useRestriction(Permission.UpdateFormTemplate);

  const shouldShowSettings = canUpdateDropzone
  || canUpdatePlane
  || canUpdateTicketTypes
  || canUpdateExtras
  || canUpdatePermissions
  || canUpdateDzRigs
  || canUpdateRigInspectionTemplate;
  
  return (
    <BottomTab.Navigator
      initialRouteName="Manifest"
      tabBarOptions={{
        activeTintColor: "#FFFFFF",
        inactiveBackgroundColor: theme.colors.primary,
        activeBackgroundColor: theme.colors.primary,
        inactiveTintColor: "#CCCCCC",
        showLabel: false,
        style: {
          backgroundColor: theme.colors.primary,
        }
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
        name="Notifications"
        component={NotificationTab}
        options={{
          tabBarIcon: ({ focused, color, size }) => <MaterialCommunityIcons name="bell" color={color} size={size} />,
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
      
      { shouldShowSettings && (
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

