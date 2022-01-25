import * as React from 'react';
import { View } from 'react-native';
import { Button, Dialog, Portal, ProgressBar } from 'react-native-paper';
import { Tabs, TabScreen } from 'react-native-paper-tabs';
import { useCreateOrderMutation } from '../../../api/reflection';
import { DropzoneUser, TransactionType, WalletableTypes } from '../../../api/schema.d';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import CreditsForm from '../../forms/credits/CreditsForm';

interface IDropzoneUserDialog {
  open?: boolean;
  dropzoneUser?: DropzoneUser;
  onClose(): void;
  onSuccess(): void;
}

export default function DropzoneUserDialog(props: IDropzoneUserDialog) {
  const { open, onClose, dropzoneUser, onSuccess } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.credits);
  const globalState = useAppSelector((root) => root.global);
  const [mutationCreateOrder, createData] = useCreateOrderMutation();
  const global = useAppSelector((root) => root.global);

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

    if (!dropzoneUser?.id || state.fields.amount.value === null || !global.currentDropzoneId) {
      return;
    }

    try {
      const response = await mutationCreateOrder({
        variables: {
          amount: state.fields.amount.value,
          title:
            state.fields.message.value ||
            `${
              state.fields.transactionType.value === TransactionType.Deposit
                ? 'Added funds'
                : 'Withdrew funds'
            }`,
          seller:
            state.fields.transactionType.value !== TransactionType.Deposit
              ? {
                  type: WalletableTypes.Dropzone,
                  id: `${global.currentDropzoneId}`,
                }
              : {
                  type: WalletableTypes.DropzoneUser,
                  id: dropzoneUser.id,
                },
          buyer:
            state.fields.transactionType.value === TransactionType.Deposit
              ? {
                  type: WalletableTypes.Dropzone,
                  id: `${global.currentDropzoneId}`,
                }
              : {
                  type: WalletableTypes.DropzoneUser,
                  id: dropzoneUser.id,
                },
          dropzoneId: Number(global.currentDropzoneId),
        },
      });
      const { data: result } = response;

      result?.createOrder?.fieldErrors?.map(({ field, message }) => {
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
      if (result?.createOrder?.errors?.length) {
        dispatch(
          actions.notifications.showSnackbar({
            message: result?.createOrder?.errors[0],
            variant: 'error',
          })
        );
        return;
      }
      if (!result?.createOrder?.fieldErrors?.length) {
        dispatch(actions.forms.credits.reset());
        onSuccess();
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
    validate,
    dropzoneUser?.id,
    state.fields.amount.value,
    state.fields.message.value,
    state.fields.transactionType.value,
    global.currentDropzoneId,
    mutationCreateOrder,
    dispatch,
    onSuccess,
  ]);

  return (
    <Portal>
      <Dialog visible={!!open} style={{ maxWidth: 500, alignSelf: 'center' }}>
        <View>
          <Tabs
            defaultIndex={0} // default = 0
            onChangeIndex={(newIndex) => {
              dispatch(
                actions.forms.credits.setField([
                  'transactionType',
                  newIndex === 1 ? 'withdrawal' : 'deposit',
                ])
              );
            }}
            mode="fixed"
          >
            <TabScreen label="Deposit" icon="arrow-up">
              <View />
            </TabScreen>
            <TabScreen label="Withdraw" icon="arrow-down">
              <View />
            </TabScreen>
          </Tabs>
        </View>
        <ProgressBar
          indeterminate
          visible={createData.loading}
          color={globalState.theme.colors.accent}
        />
        <Dialog.Content>
          <CreditsForm />
        </Dialog.Content>

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
