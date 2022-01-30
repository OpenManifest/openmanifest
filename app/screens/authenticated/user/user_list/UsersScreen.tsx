import { useIsFocused, useNavigation } from '@react-navigation/core';
import * as React from 'react';
import { RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Avatar, Card, FAB, List, ProgressBar, useTheme } from 'react-native-paper';

import { FlatList } from 'react-native-gesture-handler';
import SkeletonContent from 'app/components/Skeleton';
import NoResults from 'app/components/NoResults';
import { Permission } from 'app/api/schema.d';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import useRestriction from 'app/hooks/useRestriction';
import CreateGhostDialog from 'app/components/dialogs/Ghost';
import { useDropzoneUsersQuery } from 'app/api/reflection';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import { useUserNavigation } from '../routes';

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
        { key: 'user-avatar', height: 48, width: 48, marginHorizontal: 12, borderRadius: 48 / 2 },
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

const loadingFragment: DropzoneUserEssentialsFragment = {
  id: '__LOADING__',
  hasCredits: false,
  hasExitWeight: false,
  hasLicense: false,
  hasMembership: false,
  user: {
    id: '__LOADING__'
  }
};

export type UserListRoute = {
  UserListScreen: undefined
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

  const navigation = useUserNavigation();

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
  const theme = useTheme();

  return (
    <View style={{ flexGrow: 1, backgroundColor: theme.colors.surface }}>
      <ProgressBar indeterminate color={global.theme.colors.primary} visible={loading} />
      {users?.length ? null : (
        <View style={styles.empty}>
          <NoResults title="No users" subtitle="" />
        </View>
      )}
      <FlatList<DropzoneUserEssentialsFragment>
        data={initialLoading ? new Array(8).fill(loadingFragment) : users.map((edge) => edge?.node)}
        onRefresh={() =>
          refetch({
            dropzoneId: Number(global.currentDropzoneId),
            search: state.searchText,
          })
        }
        keyExtractor={(item, idx) => `user-${item?.id || idx}-${idx}`}
        style={{
          flex: 1,
          paddingTop: 0,
        }}
        refreshing={loading}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
        numColumns={numColumns}
        contentContainerStyle={{ width: '100%', alignSelf: 'center' }}
        renderItem={({ item }) =>
          item.id === '__LOADING__' ? (
            <UserCardSkeleton />
          ) : (
            <Card
              key={`user-${item?.id}`}
              style={{ margin: 0, marginVertical: 0, borderRadius: 2, width: '100%' }}
            >
              <Card.Content
                style={{ paddingLeft: 0, paddingTop: 4, paddingRight: 0, paddingBottom: 4 }}
              >
                <List.Item
                  style={{ width: '100%' }}
                  title={item?.user.name}
                  titleStyle={{ fontWeight: 'bold' }}
                  descriptionStyle={{ fontSize: 12 }}
                  description={item?.role?.name?.replace('_', ' ').toUpperCase()}
                  left={() =>
                    !item?.user?.image ? (
                      <Avatar.Icon
                        icon="account"
                        style={{
                          alignSelf: 'center',
                          marginHorizontal: 22,
                        }}
                        size={48}
                      />
                    ) : (
                      <Avatar.Image
                        source={{ uri: item?.user.image }}
                        style={{
                          alignSelf: 'center',
                          marginHorizontal: 22,
                          backgroundColor: global.palette.primary.light,
                        }}
                        size={48}
                      />
                    )
                  }
                  right={() => <List.Icon icon="chevron-right" />}
                  onPress={() =>
                    navigation.navigate('ProfileScreen', {
                      userId: item?.id,
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
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
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
    </View>
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
