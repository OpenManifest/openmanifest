import { useApolloClient } from '@apollo/client';
import * as React from 'react';
import { Button, Dialog, List } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';
import PermissionBadges from 'app/screens/authenticated/user/profile/UserInfo/PermissionBadges';
import { Membership, Permission } from 'app/api/schema.d';
import type { MembershipEssentialsFragment, MembershipProfileFragment } from 'app/api/operations';
import { MembershipProfileFragmentDoc } from 'app/api/reflection';
import { useAppTheme } from 'app/theme';
import MembershipForm from './MembershipForm';
import useMembershipForm from './useForm';

export interface IMembershipDialogProps {
  open?: boolean;
  /** The member being edited */
  membership?: MembershipEssentialsFragment | null;
  onClose(): void;
  onSuccess?(user: MembershipEssentialsFragment): void;
}

export default function MembershipDialog(props: IMembershipDialogProps) {
  const { open, membership, onClose, onSuccess } = props;
  const { theme } = useAppTheme();
  const client = useApolloClient();
  const { control, loading, onSubmit } = useMembershipForm({
    membership,
    onSuccess: (user) => {
      onSuccess?.(user);
      onClose();
    },
  });

  const cachedUser = membership
    ? client.readFragment<MembershipProfileFragment>({
        fragment: MembershipProfileFragmentDoc,
        fragmentName: 'membershipProfile',
        id: client.cache.identify(membership),
      })
    : null;

  return (
    <Dialog visible={!!open} onDismiss={onClose}>
      <ProgressBar indeterminate visible={loading} color={theme.colors.primary} />
      <Dialog.Title>{`${membership?.id ? 'Edit' : 'New'} dropzone user`}</Dialog.Title>
      <Dialog.Content>
        <MembershipForm {...{ control }} />
        {cachedUser ? (
          <>
            <List.Subheader style={{ paddingLeft: 0 }}>Acting permissions</List.Subheader>
            <PermissionBadges
              membership={cachedUser as Membership}
              permissions={
                (cachedUser as Membership).permissions?.filter((name) =>
                  /^actAs/.test(name)
                ) as Permission[]
              }
            />
          </>
        ) : null}
      </Dialog.Content>
      <Dialog.Actions style={{ justifyContent: 'flex-end' }}>
        <Button onPress={onClose}>Cancel</Button>
        <Button onPress={onSubmit}>Save</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
