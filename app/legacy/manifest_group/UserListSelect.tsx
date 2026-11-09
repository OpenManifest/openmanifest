import * as React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Divider, Icon, ListRow, TextField } from 'app/ui';
import { ScrollView } from 'react-native-gesture-handler';
import { useMembershipsDetailedQuery } from 'app/api/reflection';

import { MembershipEssentialsFragment } from 'app/api/operations';
import UserAvatar from 'app/components/UserAvatar';
import { Permission } from 'app/api/schema.d';
import { useSession } from 'app/state';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorContext } from 'app/providers/operator/context';
import NoResults from 'app/components/NoResults';

interface IUserListSelect {
  hideButton?: boolean;
  containerProps?: ViewProps;
  scrollable?: boolean;
  value: { id: number }[];
  onSelect(membership: MembershipEssentialsFragment): void;
}

export default function UserListSelect(props: IUserListSelect) {
  const { value, onSelect, containerProps, scrollable } = props;
  const [searchText, setSearchText] = React.useState('');
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const { data } = useMembershipsDetailedQuery({
    variables: {
      operatorId: currentOperatorId?.toString() as string,
      search: searchText,
    },
  });

  const {
    operator: { currentUser },
  } = useOperatorContext();
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
      <TextField
        label=""
        placeholder="Search skydivers"
        value={searchText}
        onChange={setSearchText}
      />
      <View {...containerProps}>
        <Wrapper>
          {!data?.memberships?.edges?.length && <NoResults title="No users" subtitle="" />}

          {data?.memberships?.edges?.map((edge) => (
            <React.Fragment key={`user-${edge?.node?.id || 0}`}>
              <ListRow
                title={edge?.node?.user.name || ''}
                supporting={edge?.node?.role?.name || undefined}
                selected={value?.map(({ id }) => id).includes(Number(edge?.node?.id))}
                leading={
                  <UserAvatar
                    name={edge?.node?.user?.name}
                    image={edge?.node?.user?.image}
                    size={36}
                  />
                }
                trailing={
                  <Icon
                    name={
                      value?.map(({ id }) => id).includes(Number(edge?.node?.id))
                        ? 'checkbox-marked'
                        : 'checkbox-blank-outline'
                    }
                    tone="brand"
                  />
                }
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
              <Divider />
            </React.Fragment>
          ))}
        </Wrapper>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 8,
  },
});
