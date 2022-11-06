import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import * as React from 'react';
import { View } from 'react-native';
import { Tabs, TabScreen } from 'react-native-paper-tabs';
import { useCreateOrderMutation } from 'app/api/reflection';
import { TransactionType } from 'app/api/schema.d';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import { useDropzoneContext } from 'app/api/crud';
import CreditsForm from '../../forms/credits/CreditsForm';

interface IDropzoneUserDialog {
  open?: boolean;
  dropzoneUser?: DropzoneUserEssentialsFragment;
  onClose(): void;
  onSuccess(): void;
}

export default function DropzoneUserDialog(props: IDropzoneUserDialog) {
  const { open, onClose, dropzoneUser, onSuccess } = props;
  const dispatch = useAppDispatch();
  const { dropzone } = useDropzoneContext();
  const state = useAppSelector((root) => root.forms.credits);
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

    if (
      !dropzoneUser?.id ||
      !dropzoneUser?.walletId ||
      !dropzone?.walletId ||
      state.fields.amount.value === null ||
      !global.currentDropzoneId
    ) {
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
              ? dropzone.walletId
              : dropzoneUser.walletId,
          buyer:
            state.fields.transactionType.value === TransactionType.Deposit
              ? dropzone.walletId
              : dropzoneUser.walletId,
          dropzone: dropzone.id,
        },
      });
      console.debug({ response });
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
      console.error(error);
      if (error instanceof Error) {
        dispatch(
          actions.notifications.showSnackbar({
            message: error.message,
            variant: 'error',
          })
        );
      }
    }
  }, [
    validate,
    dropzoneUser?.id,
    dropzoneUser?.walletId,
    dropzone?.walletId,
    dropzone?.id,
    state.fields.amount.value,
    state.fields.message.value,
    state.fields.transactionType.value,
    global.currentDropzoneId,
    mutationCreateOrder,
    dispatch,
    onSuccess,
  ]);

  return (
    <DialogOrSheet
      // eslint-disable-next-line max-len
      loading={createData.loading}
      {...{ open }}
      disablePadding
      buttonLabel="Save"
      onClose={() => {
        dispatch(actions.forms.credits.reset());
        onClose();
      }}
      buttonAction={onSave}
      scrollable={false}
    >
      <View style={{ marginBottom: 24 }}>
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
      <CreditsForm />
    </DialogOrSheet>
  );
}
