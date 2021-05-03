import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Checkbox, Divider, List, Searchbar } from 'react-native-paper';
import { ScrollView } from "react-native-gesture-handler";

import NoResults from '../../../components/NoResults';
import { DropzoneUser, Query } from '../../../graphql/schema';
import { manifestActions, slotsMultipleForm, useAppDispatch, useAppSelector } from '../../../redux';



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
  const {global, manifest } = useAppSelector(state => state);
  const dispatch = useAppDispatch();
  const [searchText, setSearchText] = React.useState("");

  const { data, loading } = useQuery<Query>(QUERY_DROPZONE_USERS, {
    variables: {
      dropzoneId: Number(global.currentDropzone?.id),
      search: searchText,
    }
  });


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
    </ScrollView>
    </View>
    <Button
      onPress={() => {
        dispatch(slotsMultipleForm.setDropzoneUsers(manifest.selectedUsers));
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
