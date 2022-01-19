import { useIsFocused, useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Avatar, Card, FAB, List, ProgressBar, useTheme } from 'react-native-paper';

import { FlatList } from 'react-native-gesture-handler';
import SkeletonContent from 'react-native-skeleton-content';
import NoResults from 'app/components/NoResults';
import { Permission } from 'app/api/schema.d';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import useRestriction from 'app/hooks/useRestriction';
import CreateGhostDialog from 'app/components/dialogs/Ghost';
import { useDropzoneUsersQuery } from 'app/api/reflection';

function UserCardSkeleton() {
  const theme = useTheme();
  return (
    <SkeletonContent
      isLoading
      containerStyle={{
        height: 75,
        backgroundColor: theme.colors.surface,
        width: '100%',
        padding: 16,
        margin: 1,
        flexDirection: 'row',
      }}
      layout={[
        { key: 'user-avatar', height: 36, width: 36, marginHorizontal: 12, borderRadius: 36 / 2 },
        {
          key: 'list-container',
          flexDirection: 'column',
          children: [
            {
              key: 'user-name',
              height: 14,
              width: 180,
              marginTop: 2,
              marginLeft: 8,
              borderRadius: 55 / 2,
            },
            {
              key: 'user-role',
              height: 14,
              width: 100,
              marginTop: 8,
              marginLeft: 8,
              borderRadius: 55 / 2,
            },
          ],
        },
      ]}
    />
  );
}
export default function UsersScreen() {
  const global = useAppSelector((root) => root.global);
  const state = useAppSelector((root) => root.screens.users);
  const ghostForm = useAppSelector((root) => root.forms.ghost);
  const dispatch = useAppDispatch();

  const { data, loading, refetch } = useDropzoneUsersQuery({
    variables: {
      dropzoneId: Number(global.currentDropzoneId),
      search: state.searchText,
    },
    fetchPolicy: 'cache-and-network',
  });

  const navigation = useNavigation();

  const isFocused = useIsFocused();
  React.useEffect(() => {
    if (state.isSearchVisible && !isFocused) {
      dispatch(actions.screens.users.setSearchVisible(false));
    }
  }, [dispatch, isFocused, state.isSearchVisible]);

  const canCreateUser = useRestriction(Permission.CreateUser);
  const { width } = useWindowDimensions();

  const cardWidth = 370;
  const numColumns = Math.floor(width / cardWidth) || 1;

  const users = data?.dropzone?.dropzoneUsers?.edges || [];
  const initialLoading = !users?.length && loading;

  return (
    <>
      <ProgressBar indeterminate color={global.theme.colors.accent} visible={loading} />
      {users?.length ? null : (
        <View style={styles.empty}>
          <NoResults title="No users" subtitle="" />
        </View>
      )}
      <FlatList
        data={initialLoading ? [1, 1, 1, 11, 1, 1, 1, 1] : users}
        onRefresh={() =>
          refetch({
            dropzoneId: Number(global.currentDropzoneId),
            search: state.searchText,
          })
        }
        keyExtractor={({ item }, idx) => `user-${item?.node?.id || idx}`}
        style={{
          flex: 1,
          paddingTop: 0,
        }}
        refreshing={loading}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
        numColumns={numColumns}
        contentContainerStyle={{ width: '100%', alignSelf: 'center' }}
        renderItem={({ item: edge }) =>
          edge === 1 ? (
            <UserCardSkeleton />
          ) : (
            <Card
              key={`user-${edge?.node?.id}`}
              style={{ margin: 0, marginVertical: 0, borderRadius: 2, width: '100%' }}
            >
              <Card.Content
                style={{ paddingLeft: 0, paddingTop: 0, paddingRight: 0, paddingBottom: 0 }}
              >
                <List.Item
                  style={{ width: '100%' }}
                  title={edge?.node?.user.name}
                  titleStyle={{ fontWeight: 'bold' }}
                  descriptionStyle={{ fontSize: 12 }}
                  description={edge?.node?.role?.name?.replace('_', ' ').toUpperCase()}
                  left={() =>
                    !edge?.node?.user?.image ? (
                      <Avatar.Icon
                        icon="account"
                        style={{
                          alignSelf: 'center',
                          marginHorizontal: 22,
                        }}
                        size={36}
                      />
                    ) : (
                      <Avatar.Image
                        source={{ uri: edge?.node?.user.image }}
                        style={{
                          alignSelf: 'center',
                          marginHorizontal: 22,
                          backgroundColor: global.palette.primary.light,
                        }}
                        size={36}
                      />
                    )
                  }
                  right={() => <List.Icon icon="chevron-right" />}
                  onPress={() =>
                    navigation.navigate('UserProfileScreen', {
                      userId: edge?.node?.id,
                    })
                  }
                />
              </Card.Content>
            </Card>
          )
        }
      />

      {canCreateUser && (
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
        onClose={() => requestAnimationFrame(() => dispatch(actions.forms.ghost.setOpen(false)))}
        onSuccess={() => {
          requestAnimationFrame(() => {
            dispatch(actions.forms.ghost.setOpen(false));
            refetch();
          });
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    ...StyleSheet.absoluteFillObject,
    flexGrow: 1,
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
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
