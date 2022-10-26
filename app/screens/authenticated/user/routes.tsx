import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { useDropzoneContext } from 'app/api/crud/useDropzone';

import { AppSignalBoundary } from 'app/components/app_signal';
import UsersScreen, { UserListRoute } from './user_list/UsersScreen';
import SearchableAppBar from './user_list/AppBar';
import RigInspectionScreen, { RigInspectionRoute } from './rig_inspection/RigInspectionScreen';
import ProfileScreen, { ProfileRoute } from './profile/ProfileScreen';
import OrdersScreen, { OrdersRoute } from './orders/OrdersScreen';
import EquipmentScreen, { EquipmentRoute } from './equipment/EquipmentScreen';
import OrderReceiptScreen, { OrderReceiptRoute } from './order_receipt/OrderScreen';

export type UserRoutes = EquipmentRoute &
  OrderReceiptRoute &
  RigInspectionRoute &
  ProfileRoute &
  UserListRoute &
  OrdersRoute;

const Users = createStackNavigator<UserRoutes>();

export default function Routes() {
  const { isSearchVisible, searchText } = useAppSelector((root) => root.screens.users);
  const dispatch = useAppDispatch();
  const { currentUser } = useDropzoneContext();

  return (
    <AppSignalBoundary>
      <Users.Navigator
        screenOptions={{
          cardStyle: {
            flex: 1,
          },
          presentation: 'modal',
        }}
      >
        <Users.Screen
          name="UserListScreen"
          component={UsersScreen}
          options={{
            title: 'Dropzone users',
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
          }}
        />
        <Users.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{ title: 'User' }}
          initialParams={{
            userId: currentUser?.id,
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
        <Users.Screen
          name="OrderReceiptScreen"
          component={OrderReceiptScreen}
          options={{ title: 'Order' }}
        />
      </Users.Navigator>
    </AppSignalBoundary>
  );
}
