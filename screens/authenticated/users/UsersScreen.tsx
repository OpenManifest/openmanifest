import { useQuery } from '@apollo/client';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import gql from 'graphql-tag';
import * as React from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { Avatar, Divider, FAB, List, ProgressBar } from 'react-native-paper';

import NoResults from '../../../components/NoResults';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import { Permission, Query } from '../../../graphql/schema.d';
import { actions,  useAppDispatch, useAppSelector } from '../../../redux';
import useRestriction from '../../../hooks/useRestriction';
import CreateGhostDialog from '../../../components/dialogs/Ghost';
import { FlatList } from 'react-native-gesture-handler';

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
              image
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
}
export default function UsersScreen() {
  const global = useAppSelector(state => state.global);
  const state = useAppSelector(state => state.screens.users);
  const ghostForm = useAppSelector(state => state.forms.ghost);
  const dispatch = useAppDispatch();

  const { data, loading, refetch } = useQuery<Query>(QUERY_DROPZONE_USERS, {
    variables: {
      dropzoneId: Number(global.currentDropzoneId),
      search: state.searchText,
    },
    fetchPolicy: "network-only",  
  });

  const navigation = useNavigation();

  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (state.isSearchVisible) {
      dispatch(actions.screens.users.setSearchVisible(false));
    }

  }, [isFocused]);


  const canCreateUser = useRestriction(Permission.CreateUser);


  return (
    <>
      <ProgressBar indeterminate color={global.theme.colors.accent} visible={loading} />
      <FlatList
        data={data?.dropzone?.dropzoneUsers?.edges || []}
        onRefresh={() => refetch({
          dropzoneId: Number(global.currentDropzoneId),
          search: state.searchText,
        })}
        refreshing={loading}

        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch}/>}
        style={{ flexGrow: 1 }}
        ListEmptyComponent={() => (
          <View style={{ alignSelf: "center", alignItems: "center", justifyContent: "center" }}>
            <NoResults title="No users" subtitle="" />
          </View>
        )}
        numColumns={1}
        renderItem={({ item: edge }) => (
        <React.Fragment key={`user-${edge?.node?.id}`}>
          <List.Item
              style={{ width: "100%"}}
              title={edge?.node?.user.name}
              description={
                edge?.node?.role?.name?.replace('_', ' ').toUpperCase()
              }
              left={() =>
                !edge?.node?.user?.image
                  ? <List.Icon icon="account" />
                  : <Avatar.Image source={{ uri: edge?.node?.user.image }} style={{ alignSelf: "center", marginHorizontal: 12 }} size={32} />
              }
              onPress={() => navigation.navigate("UserProfileScreen", { userId: edge?.node?.id })}
            />
            <Divider style={{ width: "100%" }} key={`divider-${edge?.node!.id}`}/>
          </React.Fragment>
        )}
      />
        
       
      { canCreateUser && (
        <FAB
        style={styles.fab}
        small
        icon="plus"
        onPress={() => dispatch(actions.forms.ghost.setOpen(true))}
        label="Add user"
        />
        )}
      <CreateGhostDialog
        open={ghostForm.open}
        onClose={() => dispatch(actions.forms.ghost.setOpen(false))}
        onSuccess={() => {
          dispatch(actions.forms.ghost.setOpen(false));
          refetch();
        }}
      />
    </>
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
