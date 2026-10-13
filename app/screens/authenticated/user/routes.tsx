import { createStackNavigator, StackHeaderProps } from '@react-navigation/stack';
import * as React from 'react';
import { useOperatorContext } from 'app/providers/operator/context';

import { AppSignalBoundary } from 'app/components/app_signal';
import UsersScreen, { UserListRoute } from './user_list/UsersScreen';
import { useTranslation } from 'react-i18next';
import ScreenHeader from 'app/navigation/ScreenHeader';
import { UserSearchProvider, useUserSearch } from './user_list/search';
import EquipmentInspectionScreen, {
  EquipmentInspectionRoute,
} from './equipment_inspection/EquipmentInspectionScreen';
import ProfileScreen, { ProfileRoute } from './profile/ProfileScreen';
import OrdersScreen, { OrdersRoute } from './orders/OrdersScreen';
import EquipmentScreen, { EquipmentRoute } from './equipment/EquipmentScreen';
import OrderReceiptScreen, { OrderReceiptRoute } from './order_receipt/OrderScreen';

export type UserRoutes = EquipmentRoute &
  OrderReceiptRoute &
  EquipmentInspectionRoute &
  ProfileRoute &
  UserListRoute &
  OrdersRoute;

const Users = createStackNavigator<UserRoutes>();

function UserListHeader(props: StackHeaderProps) {
  const { t } = useTranslation('common');
  const { searchText, searchVisible, setSearchText, setSearchVisible } = useUserSearch();

  return (
    <ScreenHeader
      {...props}
      hideWarnings
      search={{
        visible: searchVisible,
        text: searchText || '',
        placeholder: t('header.searchPeople'),
        setVisible: setSearchVisible,
        onChange: setSearchText,
      }}
    />
  );
}

export default function Routes() {
  const { t } = useTranslation('common');
  const {
    operator: { currentUser },
  } = useOperatorContext();

  return (
    <UserSearchProvider>
      <AppSignalBoundary>
        <Users.Navigator
          screenOptions={{
            cardStyle: {
              flex: 1,
            },
            presentation: 'modal',
            header: (props) => <ScreenHeader {...props} hideWarnings />,
          }}
        >
          <Users.Screen
            name="UserListScreen"
            component={UsersScreen}
            options={{
              title: t('screens.people'),
              headerShown: true,
              header: (props) => <UserListHeader {...props} />,
            }}
          />
          <Users.Screen
            name="ProfileScreen"
            component={ProfileScreen}
            options={{ title: t('screens.user') }}
            initialParams={{
              userId: currentUser?.id,
            }}
          />
          <Users.Screen
            name="EquipmentInspectionScreen"
            component={EquipmentInspectionScreen}
            options={{ title: t('screens.inspection') }}
          />
          <Users.Screen
            name="OrdersScreen"
            component={OrdersScreen}
            options={{ title: t('screens.transactions') }}
          />
          <Users.Screen
            name="EquipmentScreen"
            component={EquipmentScreen}
            options={{ title: t('screens.equipment') }}
          />
          <Users.Screen
            name="OrderReceiptScreen"
            component={OrderReceiptScreen}
            options={{ title: t('screens.order') }}
          />
        </Users.Navigator>
      </AppSignalBoundary>
    </UserSearchProvider>
  );
}
