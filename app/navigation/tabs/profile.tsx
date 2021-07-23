import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import AppBar from '../AppBar';
import useCurrentDropzone from '../../api/hooks/useCurrentDropzone';

import ProfileScreen from '../../screens/authenticated/profile/ProfileScreen';

export type IProfileTabParams = {
  ProfileScreen: {
    userId: string;
  };
};

const Profile = createStackNavigator<IProfileTabParams>();

export default function ProfileTab() {
  const { currentUser } = useCurrentDropzone();

  return (
    <Profile.Navigator
      screenOptions={{
        headerShown: true,
        header: (props) => <AppBar {...props} hideWarnings />,
        cardStyle: {
          flex: 1,
        },
      }}
    >
      <Profile.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
        initialParams={{
          userId: currentUser?.id,
        }}
      />
    </Profile.Navigator>
  );
}
