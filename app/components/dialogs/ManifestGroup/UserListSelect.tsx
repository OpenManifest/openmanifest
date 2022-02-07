import * as React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Avatar, Button, Checkbox, Divider, List, Searchbar } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import { useDropzoneUsersDetailedQuery } from 'app/api/reflection';

import NoResults from '../../NoResults';
import { DropzoneUser, Permission } from '../../../api/schema.d';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import useRestriction from '../../../hooks/useRestriction';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';

interface IUserListSelect {
  hideButton?: boolean;
  containerProps?: ViewProps;
  onNext(): void;
}

export default function UserListSelect(props: IUserListSelect) {
  const { hideButton, onNext, containerProps } = props;
  const { screens } = useAppSelector((root) => root);
  const dispatch = useAppDispatch();
  const [searchText, setSearchText] = React.useState('');
  const { currentDropzoneId } = useAppSelector((root) => root.global);
  const { data } = useDropzoneUsersDetailedQuery({
    variables: {
      dropzoneId: Number(currentDropzoneId),
      search: searchText,
    },
  });

  const { currentUser } = useCurrentDropzone();
  const canManifestGroup = useRestriction(Permission.CreateUserSlot);
  const canManifestGroupWithSelfOnly = useRestriction(Permission.CreateUserSlotWithSelf);

  return (
    <>
      <Searchbar value={searchText} onChangeText={setSearchText} placeholder="Search skydivers" />
      <View style={{ height: 380 }} {...containerProps}>
        <ScrollView contentContainerStyle={{ paddingTop: 16 }}>
          {!data?.dropzone?.dropzoneUsers?.edges?.length && (
            <NoResults title="No users" subtitle="" />
          )}

          {data?.dropzone?.dropzoneUsers?.edges?.map((edge) => (
            <React.Fragment key={`user-${edge?.node?.id || 0}`}>
              <List.Item
                style={{ width: '100%' }}
                key={`user-${edge?.node?.id}`}
                title={edge?.node?.user.name}
                description={edge?.node?.role?.name}
                left={() =>
                  !edge?.node?.user?.image ? (
                    <List.Icon icon="account" />
                  ) : (
                    <Avatar.Image
                      source={{ uri: edge?.node?.user.image }}
                      style={{ alignSelf: 'center', marginHorizontal: 12 }}
                      size={32}
                    />
                  )
                }
                right={() => (
                  <Checkbox
                    status={
                      screens.manifest.selectedUsers
                        ?.map<string>(({ id }) => id)
                        .includes(edge?.node?.id as string)
                        ? 'checked'
                        : 'unchecked'
                    }
                  />
                )}
                disabled={
                  // Dont allow removing current user if the user
                  // can only manifest a group with themselves in it
                  edge?.node?.user.id === currentUser?.id &&
                  canManifestGroupWithSelfOnly &&
                  !canManifestGroup
                }
                onPress={() => {
                  dispatch(
                    actions.screens.manifest.setSelected(
                      screens.manifest.selectedUsers?.find(({ id }) => id === `${edge?.node?.id}`)
                        ? screens.manifest.selectedUsers?.filter(
                            ({ id }) => id !== `${edge?.node?.id}`
                          )
                        : ([...screens.manifest.selectedUsers, edge?.node] as DropzoneUser[])
                    )
                  );
                }}
              />
              <Divider style={{ width: '100%' }} key={`divider-${edge?.node?.id}`} />
            </React.Fragment>
          ))}
        </ScrollView>
      </View>
      {hideButton ? null : (
        <Button
          onPress={() => {
            dispatch(actions.forms.manifestGroup.setDropzoneUsers(screens.manifest.selectedUsers));
            onNext();
          }}
          style={styles.button}
          mode="contained"
        >
          Next
        </Button>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: 16,
    padding: 5,
  },
  scrollView: {
    height: 100,
  },
});
