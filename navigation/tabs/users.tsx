import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import UsersScreen from '../../screens/authenticated/users/UsersScreen';
import SearchableAppBar from '../../screens/authenticated/users/AppBar';
import UserProfileScreen from '../../screens/authenticated/profile/UserProfileScreen';
import UserRigScreen from '../../screens/authenticated/rig/UserRigScreen';
import { useAppDispatch, useAppSelector, usersActions } from '../../redux';
import ProfileScreen from '../../screens/authenticated/profile/ProfileScreen';

export type ISettingsTabParams = {
  UsersScreen: undefined;
  UserRigScreen: undefined;
  UserProfileScreen: undefined;
}

const Settings = createStackNavigator<ISettingsTabParams>();

export default function SettingsTab() {
  const { isSearchVisible, searchText } = useAppSelector(state => state.usersScreen);
  const dispatch = useAppDispatch();

  return (
    <Settings.Navigator
      screenOptions={{
        headerShown: true,
        header: (props) =>
          <SearchableAppBar
            {...props}
            searchText={searchText}
            searchVisible={isSearchVisible}
            setSearchVisible={(visible) => dispatch(usersActions.setSearchVisible(visible))}
            onSearch={(text) => dispatch(usersActions.setSearchText(text))}
          />,
        cardStyle: {
          flex: 1
        }
      }}
    >
      <Settings.Screen name="UsersScreen" component={UsersScreen} options={{ title: "Dropzone users" }} />
      <Settings.Screen name="UserProfileScreen" component={ProfileScreen} options={{ title: "User" }} />
      <Settings.Screen name="UserRigScreen" component={UserRigScreen} />
    </Settings.Navigator>
  );
}
