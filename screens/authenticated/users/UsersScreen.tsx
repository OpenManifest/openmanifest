import { useQuery } from '@apollo/client';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Avatar, Divider, List, ProgressBar } from 'react-native-paper';

import NoResults from '../../../components/NoResults';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import { Query } from '../../../graphql/schema';
import { actions,  useAppDispatch, useAppSelector } from '../../../redux';



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
  const dispatch = useAppDispatch();

  const { data, loading } = useQuery<Query>(QUERY_DROPZONE_USERS, {
    variables: {
      dropzoneId: Number(global.currentDropzone?.id),
      search: state.searchText,
    }
  });

  const navigation = useNavigation();
  const route = useRoute<IUsersRouteParams>();

  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (state.isSearchVisible) {
      dispatch(actions.screens.users.setSearchVisible(false));
    }

  }, [isFocused]);



  return (
    <>
    <ProgressBar indeterminate color={global.theme.colors.accent} visible={loading} />
      <ScrollableScreen contentContainerStyle={{ paddingHorizontal: 0 }}>
        
        { !data?.dropzone?.dropzoneUsers?.edges?.length && (
          <NoResults title="No users" subtitle="" />
        )}

        { data?.dropzone?.dropzoneUsers?.edges?.map((edge) =>
          <React.Fragment key={`user-${edge?.node?.id}`}>
            <List.Item
              style={{ width: "100%"}}
              title={edge?.node?.user.name}
              description={edge?.node?.role?.name}
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

      </ScrollableScreen>
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
