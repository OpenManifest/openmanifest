import { gql, useMutation } from '@apollo/client';
import PermissionBadges from 'app/screens/authenticated/profile/UserInfo/PermissionBadges';
import * as React from 'react';
import { Button, Dialog, List, Portal, ProgressBar } from 'react-native-paper';
import { DropzoneUser, Mutation, Permission } from '../../api/schema.d';
import { actions, useAppDispatch, useAppSelector } from '../../state';
import DropzoneUserForm from '../forms/dropzone_user/DropzoneUserForm';

interface IDropzoneUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(user: DropzoneUser): void;
}

const MUTATION_EDIT_DROPZONE_USER = gql`
  mutation UpdateDropzoneUser($userRoleId: Int, $expiresAt: Int, $dropzoneUserId: Int) {
    updateDropzoneUser(
      input: { id: $dropzoneUserId, attributes: { userRoleId: $userRoleId, expiresAt: $expiresAt } }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      dropzoneUser {
        id
        credits
        expiresAt
        role {
          id
          name
        }

        user {
          id
          name
        }
      }
    }
  }
`;

export default function DropzoneUserDialog(props: IDropzoneUserDialog) {
  const { open } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.dropzoneUser);
  const globalState = useAppSelector((root) => root.global);
  const [mutationUpdateDropzoneUser, createData] = useMutation<Mutation>(
    MUTATION_EDIT_DROPZONE_USER
  );

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
          ...(state.original?.id ? { id: state.original?.id } : {}),
          userRoleId: Number(state.fields.role.value?.id),
          expiresAt: state.fields.expiresAt.value,
          dropzoneUserId: Number(state.original?.id),
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
        dispatch(
          actions.notifications.showSnackbar({
            message: result?.errors[0],
            variant: 'error',
          })
        );
        return;
      }
      if (!result?.fieldErrors?.length && result?.dropzoneUser) {
        props.onSuccess(result.dropzoneUser);
      } else {
        console.error(result?.fieldErrors);
      }
    } catch (error) {
      dispatch(
        actions.notifications.showSnackbar({
          message: error.message,
          variant: 'error',
        })
      );
    }
  }, [
    dispatch,
    mutationUpdateDropzoneUser,
    props,
    state.fields.expiresAt.value,
    state.fields.role.value?.id,
    state.original?.id,
    validate,
  ]);

  return (
    <Portal>
      <Dialog visible={!!open}>
        <ProgressBar
          indeterminate
          visible={createData.loading}
          color={globalState.theme.colors.accent}
        />
        <Dialog.Title>{`${state?.original?.id ? 'Edit' : 'New'} dropzone user`}</Dialog.Title>
        <Dialog.Content>
          <DropzoneUserForm />
          {state.original ? (
            <>
              <List.Subheader style={{ paddingLeft: 0 }}>Acting permissions</List.Subheader>
              <PermissionBadges
                dropzoneUser={state.original}
                permissions={[
                  Permission.ActAsDzso,
                  Permission.ActAsGca,
                  Permission.ActAsLoadMaster,
                  Permission.ActAsPilot,
                ]}
              />
            </>
          ) : null}
        </Dialog.Content>
        <Dialog.Actions style={{ justifyContent: 'flex-end' }}>
          <Button
            onPress={() => {
              dispatch(actions.forms.dropzoneUser.reset());
              props.onClose();
            }}
          >
            Cancel
          </Button>

          <Button onPress={onSave}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
