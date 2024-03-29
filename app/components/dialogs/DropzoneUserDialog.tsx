import { useApolloClient } from '@apollo/client';
import PermissionBadges from 'app/screens/authenticated/user/profile/UserInfo/PermissionBadges';
import * as React from 'react';
import { Button, Dialog, List, ProgressBar } from 'react-native-paper';
import { DropzoneUser, Permission } from 'app/api/schema.d';
import { DropzoneUserEssentialsFragment, DropzoneUserProfileFragment } from 'app/api/operations';
import { DropzoneUserProfileFragmentDoc, useUpdateDropzoneUserMutation } from 'app/api/reflection';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { useNotifications } from 'app/providers/notifications';
import DropzoneUserForm from '../forms/dropzone_user/DropzoneUserForm';

interface IDropzoneUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(user: DropzoneUserEssentialsFragment): void;
}

export default function DropzoneUserDialog(props: IDropzoneUserDialog) {
  const { open, onClose, onSuccess } = props;
  const notify = useNotifications();
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.dropzoneUser);
  const globalState = useAppSelector((root) => root.global);
  const client = useApolloClient();
  const getCachedUser = React.useCallback(
    () =>
      !state.original
        ? null
        : client.readFragment<DropzoneUserProfileFragment>({
            fragment: DropzoneUserProfileFragmentDoc,
            fragmentName: 'dropzoneUserProfile',
            id: client.cache.identify(state.original),
          }),
    [client, state.original]
  );
  const [mutationUpdateDropzoneUser, createData] = useUpdateDropzoneUserMutation();

  const validate = React.useCallback(() => {
    let hasErrors = false;

    if (!state.fields.role.value) {
      hasErrors = true;
      dispatch(
        actions.forms.dropzoneUser.setFieldError(['role', 'User must have an access level'])
      );
    }

    if (!state.fields.expiresAt.value) {
      hasErrors = true;
      dispatch(
        actions.forms.dropzoneUser.setFieldError(['expiresAt', 'Membership expiry must be set'])
      );
    }

    return !hasErrors;
  }, [dispatch, state.fields.expiresAt.value, state.fields.role.value]);

  const onSave = React.useCallback(async () => {
    if (!validate()) {
      return;
    }
    try {
      const response = await mutationUpdateDropzoneUser({
        variables: {
          dropzoneUserId: state.original?.id as string,
          attributes: {
            userRoleId: Number(state.fields.role.value?.id),
            expiresAt: state.fields.expiresAt.value,
          },
        },
      });
      const result = response.data?.updateDropzoneUser;

      result?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case 'user_role':
            return dispatch(actions.forms.dropzoneUser.setFieldError(['role', message]));
          case 'expires_at':
            return dispatch(actions.forms.dropzoneUser.setFieldError(['expiresAt', message]));
          default:
            return null;
        }
      });
      if (result?.errors?.length) {
        notify.error(result?.errors[0]);
        return;
      }
      if (!result?.fieldErrors?.length && result?.dropzoneUser) {
        onSuccess(result.dropzoneUser);
      } else {
        console.error(result?.fieldErrors);
      }
    } catch (error) {
      if (error instanceof Error) {
        notify.error(error.message);
      }
    }
  }, [
    dispatch,
    mutationUpdateDropzoneUser,
    notify,
    onSuccess,
    state.fields.expiresAt.value,
    state.fields.role.value?.id,
    state.original?.id,
    validate,
  ]);

  return (
    <Dialog visible={!!open}>
      <ProgressBar
        indeterminate
        visible={createData.loading}
        color={globalState.theme.colors.primary}
      />
      <Dialog.Title>{`${state?.original?.id ? 'Edit' : 'New'} dropzone user`}</Dialog.Title>
      <Dialog.Content>
        <DropzoneUserForm />
        {state.original && getCachedUser() ? (
          <>
            <List.Subheader style={{ paddingLeft: 0 }}>Acting permissions</List.Subheader>
            <PermissionBadges
              dropzoneUser={getCachedUser() as DropzoneUser}
              permissions={
                (getCachedUser() as DropzoneUser).permissions?.filter((name) =>
                  /^actAs/.test(name)
                ) as Permission[]
              }
            />
          </>
        ) : null}
      </Dialog.Content>
      <Dialog.Actions style={{ justifyContent: 'flex-end' }}>
        <Button
          onPress={() => {
            dispatch(actions.forms.dropzoneUser.reset());
            onClose();
          }}
        >
          Cancel
        </Button>

        <Button onPress={onSave}>Save</Button>
      </Dialog.Actions>
    </Dialog>
  );
}
