import { gql, useMutation } from "@apollo/client";
import React, { useCallback } from "react";
import { Button, Dialog, Portal, ProgressBar } from "react-native-paper";
import { Mutation } from "../../graphql/schema";
import { dropzoneUserForm, snackbarActions, useAppDispatch, useAppSelector } from "../../redux";
import DropzoneUserForm from "../forms/dropzone_user/DropzoneUserForm";
interface IDropzoneUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(): void;
}

const MUTATION_EDIT_DROPZONE_USER = gql`
  mutation UpdateDropzoneUser(
    $credits: Float,
    $userRoleId: Int,
    $expiresAt: Int,
    $dropzoneUserId: Int
  ) {
    updateDropzoneUser(
      input: {
        id: $dropzoneUserId,
        attributes: {
          credits: $credits,
          userRoleId: $userRoleId,
          expiresAt: $expiresAt,
        }
      }
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
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.dropzoneUserForm);
  const globalState = useAppSelector(state => state.global);
  const [mutationUpdateDropzoneUser, createData] = useMutation<Mutation>(MUTATION_EDIT_DROPZONE_USER);

  const validate = useCallback(() => {
    let hasErrors = false;
    if (!state.fields.credits.value) {
      hasErrors = true;
      dispatch(
        dropzoneUserForm.setFieldError(["credits", "Required"])
      );
    }

    if (!state.fields.role.value) {
      hasErrors = true;
      dispatch(
        dropzoneUserForm.setFieldError(["role", "User must have an access level"])
      );
    }

    if (!state.fields.expiresAt.value) {
      hasErrors = true;
      dispatch(
        dropzoneUserForm.setFieldError(["expiresAt", "Membership expiry must be set"])
      );
    }

    return !hasErrors;
  }, [JSON.stringify(state.fields)]);
  
  const onSave = useCallback(async () => {

    if (!validate()) {
      return;
    }
    try {
      const response = await mutationUpdateDropzoneUser({
        variables: {
          ...state.original?.id ? { id: state.original?.id } : {},
          credits: state.fields.credits.value,
          userRoleId: Number(state.fields.role.value?.id),
          expiresAt: state.fields.expiresAt.value,
          dropzoneUserId: Number(state.original?.id),
        }
      });
      const result = state.original?.id ? response.data?.updateRig : response.data?.createRig;

      result?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case "user_role":
            return dispatch(dropzoneUserForm.setFieldError(["role", message]));
          case "credits":
            return dispatch(dropzoneUserForm.setFieldError(["credits", message]));
          case "expires_at":
            return dispatch(dropzoneUserForm.setFieldError(["expiresAt", message]));
        }
      });
      if (result?.errors?.length) {
        return dispatch(snackbarActions.showSnackbar({ message: result?.errors[0], variant: "error" }));
      }
      if (!result?.fieldErrors?.length) {
        props.onSuccess();
      }

    } catch(error) {
      dispatch(snackbarActions.showSnackbar({ message: error.message, variant: "error" }));
    } 
  }, [JSON.stringify(state.fields), mutationUpdateDropzoneUser, props.onSuccess])
  
  return (
    <Portal>
      <Dialog visible={!!props.open}>
        <ProgressBar indeterminate visible={createData.loading} color={globalState.theme.colors.accent} />
        <Dialog.Title>
          {`${state?.original?.id ? "Edit" : "New"} dropzone user`}
        </Dialog.Title>
        <Dialog.Content>
          <DropzoneUserForm />
        </Dialog.Content>
        <Dialog.Actions style={{ justifyContent: "flex-end"}}>
          <Button
            onPress={() => {
              dispatch(dropzoneUserForm.reset());
              props.onClose();
            }}
          >
            Cancel
          </Button>
          
          <Button onPress={onSave}>
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}