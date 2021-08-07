import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { actions, useAppDispatch, useAppSelector } from '../../state';
import { Rig } from '../../api/schema';

import UsersScreen from '../../screens/authenticated/users/UsersScreen';
import SearchableAppBar from '../../screens/authenticated/users/AppBar';
import RigInspectionScreen from '../../screens/authenticated/rig/RigInspectionScreen';
import ProfileScreen from '../../screens/authenticated/profile/ProfileScreen';
import TransactionsScreen from '../../screens/authenticated/transactions/TransactionsScreen';
import EquipmentScreen from '../../screens/authenticated/equipment/EquipmentScreen';

export type ISettingsTabParams = {
  UsersScreen: {
    select?: boolean;
    loadId: number;
    onSelect?(): void;
  };
  RigInspectionScreen: { dropzoneUserId: number; rig: Rig };
  UserProfileScreen: undefined;
  TransactionsScreen: undefined;
  EquipmentScreen: undefined;
};

const Settings = createStackNavigator<ISettingsTabParams>();

export default function SettingsTab() {
  const { isSearchVisible, searchText } = useAppSelector((root) => root.screens.users);
  const dispatch = useAppDispatch();

  return (
    <Settings.Navigator
      screenOptions={{
        headerShown: true,
        header: (props) => (
          <SearchableAppBar
            {...props}
            searchText={searchText}
            searchVisible={isSearchVisible}
            setSearchVisible={(visible) =>
              dispatch(actions.screens.users.setSearchVisible(visible))
            }
            onSearch={(text) => dispatch(actions.screens.users.setSearchText(text))}
          />
        ),
        cardStyle: {
          flex: 1,
        },
      }}
    >
      <Settings.Screen
        name="UsersScreen"
        component={UsersScreen}
        options={{ title: 'Dropzone users' }}
      />
      <Settings.Screen
        name="UserProfileScreen"
        component={ProfileScreen}
        options={{ title: 'User' }}
      />
      <Settings.Screen
        name="RigInspectionScreen"
        component={RigInspectionScreen}
        options={{ title: 'Inspection' }}
      />
      <Settings.Screen
        name="TransactionsScreen"
        component={TransactionsScreen}
        options={{ title: 'Transactions' }}
      />
      <Settings.Screen
        name="EquipmentScreen"
        component={EquipmentScreen}
        options={{ title: 'Equipment' }}
      />
    </Settings.Navigator>
  );
}
