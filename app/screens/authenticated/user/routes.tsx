import { createStackNavigator, StackHeaderProps } from '@react-navigation/stack';
import * as React from 'react';
import { useDropzoneContext } from 'app/providers/dropzone/context';

import { AppSignalBoundary } from 'app/components/app_signal';
import UsersScreen, { UserListRoute } from './user_list/UsersScreen';
import SearchableAppBar from './user_list/AppBar';
import { UserSearchProvider, useUserSearch } from './user_list/search';
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

function UserListHeader(props: StackHeaderProps) {
  const { searchText, searchVisible, setSearchText, setSearchVisible } = useUserSearch();

  return (
    <SearchableAppBar
      {...props}
      searchText={searchText}
      searchVisible={searchVisible}
      setSearchVisible={setSearchVisible}
      onSearch={setSearchText}
    />
  );
}

export default function Routes() {
  const {
    dropzone: { currentUser },
  } = useDropzoneContext();

  return (
    <UserSearchProvider>
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
              header: (props) => <UserListHeader {...props} />,
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
    </UserSearchProvider>
  );
}
