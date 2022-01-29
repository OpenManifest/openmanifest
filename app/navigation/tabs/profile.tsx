import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import AppBar from '../AppBar';
import useCurrentDropzone from '../../api/hooks/useCurrentDropzone';

import ProfileScreen from '../../screens/authenticated/profile/ProfileScreen';
import NotificationsScreen from '../../screens/authenticated/notifications/NotificationsScreen';
import TransactionsScreen from '../../screens/authenticated/transactions/TransactionsScreen';
import EquipmentScreen from '../../screens/authenticated/equipment/EquipmentScreen';

export type IProfileTabParams = {
  ProfileScreen: {
    userId: string;
  };
  NotificationsScreen: undefined;
  EquipmentScreen: undefined;
  LoadScreen: undefined;
  TransactionsScreen: undefined;
};

const Profile = createStackNavigator<IProfileTabParams>();

export default function ProfileRoutes() {
  const { currentUser } = useCurrentDropzone();

  return (
    <Profile.Navigator
      screenOptions={{
        headerShown: true,
        presentation: 'modal',
        header: (props) => <AppBar {...props} hideWarnings />,
        cardStyle: {
          flex: 1,
        },
      }}
      initialRouteName="ProfileScreen"
    >
      <Profile.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
        initialParams={{
          userId: currentUser?.id,
        }}
      />
      <Profile.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Profile.Screen
        name="EquipmentScreen"
        component={EquipmentScreen}
        options={{ title: 'Equipment' }}
      />
      <Profile.Screen
        name="TransactionsScreen"
        component={TransactionsScreen}
        options={{ title: 'Transactions' }}
      />
    </Profile.Navigator>
  );
}
