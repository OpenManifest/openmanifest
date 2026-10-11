import { useApolloClient } from '@apollo/client';
import * as React from 'react';
import { Button, Dialog, List } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';
import PermissionBadges from 'app/screens/authenticated/user/profile/UserInfo/PermissionBadges';
import { DropzoneUser, Permission } from 'app/api/schema.d';
import type {
  DropzoneUserEssentialsFragment,
  DropzoneUserProfileFragment,
} from 'app/api/operations';
import { DropzoneUserProfileFragmentDoc } from 'app/api/reflection';
import { useAppTheme } from 'app/theme';
import DropzoneUserForm from './DropzoneUserForm';
import useDropzoneUserForm from './useForm';

export interface IDropzoneUserDialogProps {
  open?: boolean;
  /** The member being edited */
  dropzoneUser?: DropzoneUserEssentialsFragment | null;
  onClose(): void;
  onSuccess?(user: DropzoneUserEssentialsFragment): void;
}

export default function DropzoneUserDialog(props: IDropzoneUserDialogProps) {
  const { open, dropzoneUser, onClose, onSuccess } = props;
  const { theme } = useAppTheme();
  const client = useApolloClient();
  const { control, loading, onSubmit } = useDropzoneUserForm({
    dropzoneUser,
    onSuccess: (user) => {
      onSuccess?.(user);
      onClose();
    },
  });

  const cachedUser = dropzoneUser
    ? client.readFragment<DropzoneUserProfileFragment>({
        fragment: DropzoneUserProfileFragmentDoc,
        fragmentName: 'dropzoneUserProfile',
        id: client.cache.identify(dropzoneUser),
      })
    : null;

  return (
    <Dialog visible={!!open} onDismiss={onClose}>
      <ProgressBar indeterminate visible={loading} color={theme.colors.primary} />
      <Dialog.Title>{`${dropzoneUser?.id ? 'Edit' : 'New'} dropzone user`}</Dialog.Title>
      <Dialog.Content>
        <DropzoneUserForm {...{ control }} />
        {cachedUser ? (
          <>
            <List.Subheader style={{ paddingLeft: 0 }}>Acting permissions</List.Subheader>
            <PermissionBadges
              dropzoneUser={cachedUser as DropzoneUser}
              permissions={
                (cachedUser as DropzoneUser).permissions?.filter((name) =>
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
