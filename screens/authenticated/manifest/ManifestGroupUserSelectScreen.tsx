import { useQuery } from '@apollo/client';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Avatar, Checkbox, Divider, FAB, List, ProgressBar } from 'react-native-paper';

import NoResults from '../../../components/NoResults';
import ScrollableScreen from '../../../components/ScrollableScreen';
import { View } from '../../../components/Themed';
import { DropzoneUser, Query } from '../../../graphql/schema';
import { manifestActions, slotsMultipleForm, useAppDispatch, useAppSelector, usersActions } from '../../../redux';

import slice from "./slice";

const { actions } = slice;

const QUERY_DROPZONE_USERS = gql`
  query QueryDropzoneUsersSearch(
    $dropzoneId: Int!
    $search: String
  ) {
    dropzone(id: $dropzoneId) {
      id
      name

      dropzoneUsers(search: $search, licensed: true) {
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
  params: {
    select?: boolean;
    loadId?: number;
    onSelect?(selectedUsers?: DropzoneUser[]): void;
  }
}
export default function UsersScreen() {
  const {global, manifest } = useAppSelector(state => state);
  const dispatch = useAppDispatch();

  const { data, loading } = useQuery<Query>(QUERY_DROPZONE_USERS, {
    variables: {
      dropzoneId: Number(global.currentDropzone?.id),
      search: manifest.searchText,
    }
  });

  const navigation = useNavigation();
  const route = useRoute<IUsersRouteParams>();

  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (manifest.isSearchVisible) {
      dispatch(manifestActions.setSearchVisible(false));
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
        <>
        <List.Item
          style={{ width: "100%"}}
          key={`user-${edge?.node?.id}`}
          title={edge?.node?.user.name}
          description={edge?.node?.role?.name}
          left={() =>
            !edge?.node?.user?.image
              ? <List.Icon icon="account" />
              : <Avatar.Image source={{ uri: edge?.node?.user.image }} style={{ alignSelf: "center", marginHorizontal: 12 }} size={32} />
          }
          right={() => 
            <Checkbox.Android
              status={
                manifest.selectedUsers?.map(({ id }) => id).includes(edge!.node!.id)
                ? "checked"
                : "unchecked"
              }
            />
          }
          onPress={
              () => dispatch(
                manifestActions.setSelected(
                  manifest.selectedUsers?.find(({ id }) => id === `${edge?.node?.id}`)
                  ? manifest.selectedUsers?.filter(({ id }) => id !== `${edge?.node?.id}`)
                  : [...manifest.selectedUsers, edge!.node!],
                )
              )
          }
        />
        <Divider style={{ width: "100%" }} key={`divider-${edge?.node!.id}`}/>
        </>
      )}

    </ScrollableScreen>
    <FAB
      style={styles.fab}
      small
      visible={manifest.selectedUsers.length > 0}
      icon="check"
      onPress={() => {
        dispatch(slotsMultipleForm.setDropzoneUsers(manifest.selectedUsers));
        navigation.setParams({ select: false });
        dispatch(manifestActions.setSearchVisible(false));
        dispatch(manifestActions.setSelected([]));
        navigation.navigate("ManifestGroupScreen");
      }}
      label="Next"
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
