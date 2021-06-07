import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import AppBar from '../AppBar';
import useCurrentDropzone from '../../graphql/hooks/useCurrentDropzone';

const ProfileScreen = React.lazy(() => import('../../screens/authenticated/profile/ProfileScreen'));
const UpdateUserScreen = React.lazy(() => import('../../screens/authenticated/profile/UpdateUserScreen'));

export type IProfileTabParams = {
  ProfileScreen: {
    userId: string,
  };
  UpdateUserScreen: undefined;
}

const Profile = createStackNavigator<IProfileTabParams>();

export default function ProfileTab() {
  const { currentUser } = useCurrentDropzone();
  
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
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: "Profile" }}
        initialParams={{
          userId: currentUser?.id,
        }}
      />
      <Profile.Screen name="UpdateUserScreen" component={UpdateUserScreen} options={{ title: "Edit profile" }} />
    </Profile.Navigator>
  );
}
