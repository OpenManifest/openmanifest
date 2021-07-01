import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Checkbox, Divider, List, Searchbar } from 'react-native-paper';
import { ScrollView } from "react-native-gesture-handler";

import NoResults from '../../../components/NoResults';
import { Permission, Query } from '../../../graphql/schema.d';
import { actions, useAppDispatch, useAppSelector } from '../../../redux';
import useRestriction from '../../../hooks/useRestriction';
import useCurrentDropzone from '../../../graphql/hooks/useCurrentDropzone';



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

interface IUserListSelect {
  onNext(): void;
}

export default function UsersScreen(props: IUserListSelect) {
  const { screens } = useAppSelector(state => state);
  const dispatch = useAppDispatch();
  const [searchText, setSearchText] = React.useState("");
  const { currentDropzoneId } = useAppSelector(state => state.global);

  const { data, loading } = useQuery<Query>(QUERY_DROPZONE_USERS, {
    variables: {
      dropzoneId: Number(currentDropzoneId),
      search: searchText,
    }
  });

  const { currentUser } = useCurrentDropzone();
  const canManifestGroup = useRestriction(Permission.CreateUserSlot);
  const canManifestGroupWithSelfOnly = useRestriction(Permission.CreateUserSlotWithSelf);

  return (
    <>
    <Searchbar
      value={searchText}
      onChangeText={setSearchText}
      placeholder="Search skydivers"
    />
    <View style={{ height: 380}}>
    <ScrollView contentContainerStyle={{ paddingTop: 16 }}>
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
            <Checkbox
              status={
                screens.manifest.selectedUsers?.map(({ id }) => id).includes(edge!.node!.id)
                ? "checked"
                : "unchecked"
              }
            />
          }
          disabled={
          // Dont allow removing current user if the user
            // can only manifest a group with themselves in it
            edge?.node?.user.id === currentUser?.id && (
              canManifestGroupWithSelfOnly && !canManifestGroup
            )  
          }
          onPress={
            () => dispatch(
              actions.screens.manifest.setSelected(
                screens.manifest.selectedUsers?.find(({ id }) => id === `${edge?.node?.id}`)
                ? screens.manifest.selectedUsers?.filter(({ id }) => id !== `${edge?.node?.id}`)
                : [...screens.manifest.selectedUsers, edge!.node!],
              )
            )
          }
        />
        <Divider style={{ width: "100%" }} key={`divider-${edge?.node!.id}`}/>
        </>
      )}
    </ScrollView>
    </View>
    <Button
      onPress={() => {
        dispatch(actions.forms.manifestGroup.setDropzoneUsers(screens.manifest.selectedUsers));
        props.onNext();
      }}
      style={styles.button}
      mode="contained"
    >
      Next
    </Button>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderRadius: 16,
    padding: 5,
  },
  scrollView: {
    height: 100,
  }
});
