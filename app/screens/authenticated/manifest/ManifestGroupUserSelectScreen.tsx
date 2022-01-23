import { useIsFocused, useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Avatar, Checkbox, Divider, FAB, List, ProgressBar } from 'react-native-paper';

import NoResults from 'app/components/NoResults';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import { DropzoneUser } from 'app/api/schema.d';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { useDropzoneUsersQuery } from 'app/api/reflection';

export default function ManifestGroupUserSelectScreen() {
  const global = useAppSelector((root) => root.global);
  const manifest = useAppSelector((root) => root.screens.manifest);
  const dispatch = useAppDispatch();

  const { data, loading } = useDropzoneUsersQuery({
    variables: {
      dropzoneId: Number(global.currentDropzoneId),
      search: manifest.searchText,
    },
  });

  const navigation = useNavigation();

  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (manifest.isSearchVisible) {
      dispatch(actions.screens.manifest.setSearchVisible(false));
    }
  }, [dispatch, isFocused, manifest.isSearchVisible]);

  return (
    <>
      <ProgressBar indeterminate color={global.theme.colors.accent} visible={loading} />
      <ScrollableScreen contentContainerStyle={{ paddingHorizontal: 0 }}>
        {!data?.dropzone?.dropzoneUsers?.edges?.length && (
          <NoResults title="No users" subtitle="" />
        )}

        {data?.dropzone?.dropzoneUsers?.edges?.map((edge) => (
          <>
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
                <Checkbox.Android
                  status={
                    manifest.selectedUsers?.map(({ id }) => id).includes(edge?.node?.id || '')
                      ? 'checked'
                      : 'unchecked'
                  }
                />
              )}
              onPress={() =>
                dispatch(
                  actions.screens.manifest.setSelected(
                    manifest.selectedUsers?.find(({ id }) => id === `${edge?.node?.id}`)
                      ? manifest.selectedUsers?.filter(({ id }) => id !== `${edge?.node?.id}`)
                      : [...manifest.selectedUsers, edge?.node as DropzoneUser]
                  )
                )
              }
            />
            <Divider style={{ width: '100%' }} key={`divider-${edge?.node?.id}`} />
          </>
        ))}
      </ScrollableScreen>
      <FAB
        style={styles.fab}
        small
        visible={manifest.selectedUsers.length > 0}
        icon="check"
        onPress={() => {
          dispatch(actions.forms.manifestGroup.setDropzoneUsers(manifest.selectedUsers));
          navigation.setParams({ select: false });
          dispatch(actions.screens.manifest.setSearchVisible(false));
          dispatch(actions.screens.manifest.setSelected([]));
          navigation.navigate('ManifestGroupScreen');
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
