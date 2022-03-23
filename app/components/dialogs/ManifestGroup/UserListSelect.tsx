import * as React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Checkbox, Divider, List, Searchbar } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import { useDropzoneUsersDetailedQuery } from 'app/api/reflection';

import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import UserAvatar from 'app/components/UserAvatar';
import NoResults from '../../NoResults';
import { Permission } from '../../../api/schema.d';
import { useAppSelector } from '../../../state';
import useRestriction from '../../../hooks/useRestriction';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';

interface IUserListSelect {
  hideButton?: boolean;
  containerProps?: ViewProps;
  scrollable?: boolean;
  value: { id: number }[];
  onSelect(dropzoneUser: DropzoneUserEssentialsFragment): void;
}

export default function UserListSelect(props: IUserListSelect) {
  const { value, onSelect, containerProps, scrollable } = props;
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

  const Wrapper = React.useCallback(
    ({ children }: { children: React.ReactNode }) =>
      scrollable ? (
        <ScrollView contentContainerStyle={{ paddingTop: 16 }}>{children}</ScrollView>
      ) : (
        <View style={styles.wrapper}>{children}</View>
      ),
    [scrollable]
  );
  return (
    <>
      <Searchbar value={searchText} onChangeText={setSearchText} placeholder="Search skydivers" />
      <View {...containerProps}>
        <Wrapper>
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
                left={() => (
                  <UserAvatar
                    name={edge?.node?.user?.name}
                    image={edge?.node?.user?.image}
                    size={36}
                  />
                )}
                right={() => (
                  <Checkbox
                    status={
                      value?.map(({ id }) => id).includes(Number(edge?.node?.id))
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
                  if (edge?.node) {
                    onSelect(edge.node);
                  }
                }}
              />
              <Divider style={styles.divider} key={`divider-${edge?.node?.id}`} />
            </React.Fragment>
          ))}
        </Wrapper>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  divider: { width: '100%' },
  wrapper: {
    paddingHorizontal: 8,
  },
});
