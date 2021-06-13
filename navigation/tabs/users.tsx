import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

const UsersScreen = React.lazy(() => import('../../screens/authenticated/users/UsersScreen'));
const SearchableAppBar = React.lazy(() => import('../../screens/authenticated/users/AppBar'));
const RigInspectionScreen = React.lazy(() => import('../../screens/authenticated/rig/RigInspectionScreen'));
const ProfileScreen = React.lazy(() => import('../../screens/authenticated/profile/ProfileScreen'));
import { actions, useAppDispatch, useAppSelector } from '../../redux';
import { Rig } from '../../graphql/schema';

export type ISettingsTabParams = {
  UsersScreen: {
    select?: boolean;
    loadId: number;
    onSelect?(): void;
  };
  RigInspectionScreen: { dropzoneUserId: number, rig: Rig };
  UserProfileScreen: undefined;
}

const Settings = createStackNavigator<ISettingsTabParams>();

export default function SettingsTab() {
  const { isSearchVisible, searchText } = useAppSelector(state => state.screens.users);
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
            setSearchVisible={(visible) => dispatch(actions.screens.users.setSearchVisible(visible))}
            onSearch={(text) => dispatch(actions.screens.users.setSearchText(text))}
          />,
        cardStyle: {
          flex: 1
        }
      }}
    >
      <Settings.Screen name="UsersScreen" component={UsersScreen} options={{ title: "Dropzone users" }} />
      <Settings.Screen name="UserProfileScreen" component={ProfileScreen} options={{ title: "User" }} />
      <Settings.Screen name="RigInspectionScreen" component={RigInspectionScreen} options={{ title: "Inspection" }} />
    </Settings.Navigator>
  );
}
