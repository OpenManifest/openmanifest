import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { useOperatorContext } from 'app/providers/operator/context';

import { AppSignalBoundary } from 'app/components/app_signal';
import PeopleScreen, { type UserListRoute } from 'app/features/people/PeopleScreen';
import { useTranslation } from 'react-i18next';
import ScreenHeader from 'app/navigation/ScreenHeader';
import guarded, { guardedUnlessOwn } from 'app/navigation/AccessGuard';
import { Permission } from 'app/api/schema.d';
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

// The people of the operator are for those who may read them; a member's own profile, equipment and orders are theirs
const READ_USERS = { permission: Permission.ReadUser };
const PeopleList = guarded(PeopleScreen, READ_USERS);
const Profile = guardedUnlessOwn(ProfileScreen, READ_USERS);
const Inspection = guardedUnlessOwn(EquipmentInspectionScreen, READ_USERS);
const Orders = guardedUnlessOwn(OrdersScreen, READ_USERS);
const Equipment = guardedUnlessOwn(EquipmentScreen, READ_USERS);
const Receipt = guardedUnlessOwn(OrderReceiptScreen, READ_USERS);

export default function Routes() {
  const { t } = useTranslation('common');
  const {
    operator: { currentUser },
  } = useOperatorContext();

  return (
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
          component={PeopleList}
          options={{
            title: t('screens.people'),
            headerShown: true,
            // The search box is on the screen, with the filters
            header: (props) => <ScreenHeader {...props} hideWarnings />,
          }}
        />
        <Users.Screen
          name="ProfileScreen"
          component={Profile}
          options={{ title: t('screens.user') }}
          initialParams={{
            userId: currentUser?.id,
          }}
        />
        <Users.Screen
          name="EquipmentInspectionScreen"
          component={Inspection}
          options={{ title: t('screens.inspection') }}
        />
        <Users.Screen
          name="OrdersScreen"
          component={Orders}
          options={{ title: t('screens.transactions') }}
        />
        <Users.Screen
          name="EquipmentScreen"
          component={Equipment}
          options={{ title: t('screens.equipment') }}
        />
        <Users.Screen
          name="OrderReceiptScreen"
          component={Receipt}
          options={{ title: t('screens.order') }}
        />
      </Users.Navigator>
    </AppSignalBoundary>
  );
}
