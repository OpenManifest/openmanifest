import { gql, useMutation } from "@apollo/client";
import React, { useCallback } from "react";
import { Button, Dialog, Portal, ProgressBar } from "react-native-paper";
import { Mutation } from "../../../graphql/schema";
import { creditsForm, snackbarActions, useAppDispatch, useAppSelector } from "../../../redux";
import CreditsForm from "../../forms/credits/CreditsForm";
interface IDropzoneUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(): void;
}

const MUTATION_CREATE_TRANSACTION = gql`
  mutation CreatrTransaction(
    $message: String,
    $status: String,
    $amount: Float,
    $dropzoneUserId: Int,
  ) {
    createTransaction(
      input: {
        attributes: {
          amount: $amount,
          dropzoneUserId: $dropzoneUserId,
          message: $message,
          status: $status,
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      transaction {
        id
        amount
        message

        dropzoneUser {
          id
          credits

          transactions {
            edges {
              node {
                id
                status
                amount
                createdAt
                message
              }
            }
          }
        }
      }
    }
  }
`;

export default function DropzoneUserDialog(props: IDropzoneUserDialog) {
  const dispatch = useAppDispatch();
  const state = useAppSelector(state => state.creditsForm);
  const globalState = useAppSelector(state => state.global);
  const [mutationCreateTransaction, createData] = useMutation<Mutation>(MUTATION_CREATE_TRANSACTION);

  const validate = useCallback(() => {
    let hasErrors = false;
    if (!state.fields.amount.value) {
      hasErrors = true;
      dispatch(
        creditsForm.setFieldError(["amount", "You must specify an amount"])
      );
    }

    return !hasErrors;
  }, [JSON.stringify(state.fields)]);
  
  const onSave = useCallback(async () => {

    if (!validate()) {
      return;
    }
    try {
      const response = await mutationCreateTransaction({
        variables: {
          amount: state.fields.amount.value,
          message: state.fields.message.value,
          status: state.fields.status.value,
          dropzoneUserId: Number(state.original?.id),
        }
      });
      const result = state.original?.id ? response.data?.updateRig : response.data?.createRig;

      result?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case "amount":
            return dispatch(creditsForm.setFieldError(["amount", message]));
          case "message":
            return dispatch(creditsForm.setFieldError(["message", message]));
          case "status":
            return dispatch(creditsForm.setFieldError(["status", message]));
        }
      });
      if (result?.errors?.length) {
        return dispatch(snackbarActions.showSnackbar({ message: result?.errors[0], variant: "error" }));
      }
      if (!result?.fieldErrors?.length) {
        dispatch(creditsForm.reset());
        props.onSuccess();
      }

    } catch(error) {
      dispatch(snackbarActions.showSnackbar({ message: error.message, variant: "error" }));
    } 
  }, [JSON.stringify(state.fields), mutationCreateTransaction, props.onSuccess])
  
  return (
    <Portal>
      <Dialog visible={!!props.open}>
        <ProgressBar indeterminate visible={createData.loading} color={globalState.theme.colors.accent} />
        <CreditsForm />
        <Dialog.Actions style={{ justifyContent: "flex-end"}}>
          <Button
            onPress={() => {
              dispatch(creditsForm.reset());
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