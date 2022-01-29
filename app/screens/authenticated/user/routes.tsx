import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

import UsersScreen from './user_list/UsersScreen';
import SearchableAppBar from './user_list/AppBar';
import RigInspectionScreen from './rig/RigInspectionScreen';
import ProfileScreen from './profile/ProfileScreen';
import OrdersScreen from './orders/OrdersScreen';
import EquipmentScreen from './equipment/EquipmentScreen';
import { NavigationProp, useNavigation } from '@react-navigation/core';
import OrderReceiptScreen from './order_receipt/OrderScreen';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import { OrderEssentialsFragment, RigEssentialsFragment } from 'app/api/operations';

export type UserRoutes = {
  OrdersScreen: { userId: number };
  OrderReceiptScreen: { order: OrderEssentialsFragment };
  EquipmentScreen: { userId: number };
  RigInspectionScreen: { rig: RigEssentialsFragment; dropzoneUserId: number; };
  UsersScreen: undefined
  ProfileScreen: { userId: number }
}

const Users = createStackNavigator<UserRoutes>();

export function useUserNavigation() {
  return useNavigation<NavigationProp<UserRoutes>>();
}

export default function UserRoutes() {
  const { isSearchVisible, searchText } = useAppSelector((root) => root.screens.users);
  const dispatch = useAppDispatch();
  const { currentUser } = useCurrentDropzone();

  return (
    <Users.Navigator
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
      <Users.Screen
        name="UsersScreen"
        component={UsersScreen}
        options={{ title: 'Dropzone users' }}
      />
      <Users.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'User' }}
        initialParams={{
          userId: Number(currentUser?.id),
        }}
      />
      <Users.Screen
        name="RigInspectionScreen"
        component={RigInspectionScreen}
        options={{ title: 'Inspection' }}
      />
      <Users.Screen
        name="OrdersScreen"
        component={OrdersScreen}
        options={{ title: 'Transactions' }}
      />
      <Users.Screen
        name="EquipmentScreen"
        component={EquipmentScreen}
        options={{ title: 'Equipment' }}
      />
      <Users.Screen name="OrderReceiptScreen" component={OrderReceiptScreen} options={{ title: 'Order' }} />
    </Users.Navigator>
  );
}
