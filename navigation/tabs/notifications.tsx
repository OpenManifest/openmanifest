import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import AppBar from '../AppBar';

const NotificationsScreen = React.lazy(() => import('../../screens/authenticated/notifications/NotificationsScreen'));

export type IProfileTabParams = {
  NotificationsScreen: undefined;
}

const Profile = createStackNavigator<IProfileTabParams>();

export default function Notifications() {
  
  return (
    <Profile.Navigator
      screenOptions={{
        headerShown: true,
        header: (props) => <AppBar {...props} hideWarnings />,
        cardStyle: {
          flex: 1
        }
      }}
    >
      <Profile.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
        options={{ title: "Notifications" }}
      />
    </Profile.Navigator>
  );
}
