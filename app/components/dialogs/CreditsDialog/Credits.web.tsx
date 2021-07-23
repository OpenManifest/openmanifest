import { gql, useMutation } from '@apollo/client';
import * as React from 'react';
import { Button, Dialog, Portal, ProgressBar } from 'react-native-paper';
import { Mutation } from '../../../api/schema.d';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import CreditsForm from '../../forms/credits/CreditsForm';

interface IDropzoneUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess(): void;
}

const MUTATION_CREATE_TRANSACTION = gql`
  mutation CreatrTransaction(
    $message: String
    $status: String
    $amount: Float
    $dropzoneUserId: Int
  ) {
    createTransaction(
      input: {
        attributes: {
          amount: $amount
          dropzoneUserId: $dropzoneUserId
          message: $message
          status: $status
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
  const { open, onClose } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.credits);
  const globalState = useAppSelector((root) => root.global);
  const [mutationCreateTransaction, createData] = useMutation<Mutation>(
    MUTATION_CREATE_TRANSACTION
  );

  const validate = React.useCallback(() => {
    let hasErrors = false;
    if (!state.fields.amount.value) {
      hasErrors = true;
      dispatch(actions.forms.credits.setFieldError(['amount', 'You must specify an amount']));
    }

    return !hasErrors;
  }, [dispatch, state.fields.amount.value]);

  const onSave = React.useCallback(async () => {
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
        },
      });
      const result = state.original?.id ? response.data?.updateRig : response.data?.createRig;

      result?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case 'amount':
            return dispatch(actions.forms.credits.setFieldError(['amount', message]));
          case 'message':
            return dispatch(actions.forms.credits.setFieldError(['message', message]));
          case 'status':
            return dispatch(actions.forms.credits.setFieldError(['status', message]));
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
      if (!result?.fieldErrors?.length) {
        dispatch(actions.forms.credits.reset());
        props.onSuccess();
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
    mutationCreateTransaction,
    props,
    state.fields.amount.value,
    state.fields.message.value,
    state.fields.status.value,
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
        <CreditsForm />
        <Dialog.Actions style={{ justifyContent: 'flex-end' }}>
          <Button
            onPress={() => {
              dispatch(actions.forms.credits.reset());
              onClose();
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
