import { useQuery } from '@apollo/client';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import gql from 'graphql-tag';
import * as React from 'react';
import { DeviceEventEmitter, StyleSheet } from 'react-native';
import { Checkbox, FAB, List, ProgressBar } from 'react-native-paper';

import NoResults from '../../../components/NoResults';
import { View } from '../../../components/Themed';
import { DropzoneUser, Query } from '../../../graphql/schema';
import { slotsMultipleForm, useAppDispatch, useAppSelector, usersActions } from '../../../redux';



const QUERY_DROPZONE_USERS = gql`
  query QueryDropzoneUsersSearch(
    $dropzoneId: Int!
    $search: String
  ) {
    dropzone(id: $dropzoneId) {
      id
      name

      dropzoneUsers(search: $search) {
        edges {
          node {
            id
            role {
              id
              name
            }
            user {
              id
              name
            }
          }
        }
      }
    }
  }
`;

interface IUsersRouteParams{
  key: string,
  name: string,
  params: {
    select?: boolean;
    loadId?: number;
    onSelect?(selectedUsers?: DropzoneUser[]): void;
  }
}
export default function UsersScreen() {
  const {global, usersScreen, slotsMultipleForm: multiSlot } = useAppSelector(state => state);
  const dispatch = useAppDispatch();

  const { data, loading } = useQuery<Query>(QUERY_DROPZONE_USERS, {
    variables: {
      dropzoneId: Number(global.currentDropzone?.id),
      search: usersScreen.searchText,
    }
  });

  const navigation = useNavigation();
  const route = useRoute<IUsersRouteParams>();

  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (usersScreen.isSearchVisible) {
      dispatch(usersActions.setSearchVisible(false));
    }

    if (!isFocused && usersScreen.isSelectEnabled) {
      dispatch(usersActions.setSelectEnabled(false));
      dispatch(usersActions.setSelected([]));
    }
  }, [isFocused]);


  React.useEffect(() => {
    dispatch(usersActions.setSelectEnabled(!!route?.params?.select));
  }, [route?.params?.select])

  return (
    <View style={styles.container}>
      <ProgressBar indeterminate color={global.theme.colors.accent} visible={loading} />
      
      { !data?.dropzone?.dropzoneUsers?.edges?.length && (
        <NoResults title="No users" subtitle="" />
      )}

      { data?.dropzone?.dropzoneUsers?.edges?.map((edge) =>
        <List.Item
          title={edge?.node?.user.name}
          description={edge?.node?.role?.name}
          left={() => <List.Icon icon="account" />}
          right={() => !usersScreen.isSelectEnabled ? null :
            <Checkbox.Android
              status={
                usersScreen.selectedUsers?.map(({ id }) => id).includes(`${edge?.node?.user?.id}`)
                ? "checked"
                : "unchecked"
              }
            />
          }
          onPress={
            !usersScreen.isSelectEnabled  
              ? () => navigation.navigate("UserProfileScreen", { userId: edge?.node?.id })
              : () => dispatch(
                usersActions.setSelected(
                  usersScreen.selectedUsers?.find(({ id }) => id === `${edge?.node?.id}`)
                  ? usersScreen.selectedUsers?.filter(({ id }) => id !== `${edge?.node?.id}`)
                  : [...usersScreen.selectedUsers, edge!.node!],
                )
              )
          }
        />
      )}

      { usersScreen.isSelectEnabled && (
        <FAB
          style={styles.fab}
          small
          icon="check"
          onPress={() => {
            dispatch(slotsMultipleForm.setDropzoneUsers(usersScreen.selectedUsers));
            navigation.navigate("Manifest", {
              screen: "ManifestGroupScreen",
              params: {
                users: usersScreen.selectedUsers
              }
            })
          }}
          label="Next"
        />
      )}
    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
