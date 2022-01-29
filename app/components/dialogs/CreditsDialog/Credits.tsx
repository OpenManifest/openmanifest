import * as React from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { Button } from 'react-native-paper';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { Tabs, TabScreen } from 'react-native-paper-tabs';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import { TransactionType, WalletableTypes } from '../../../api/schema.d';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import CreditsForm from '../../forms/credits/CreditsForm';
import { useCreateOrderMutation } from '../../../api/reflection';

interface ICreditsSheet {
  open?: boolean;
  dropzoneUser?: DropzoneUserEssentialsFragment;
  onClose(): void;
  onSuccess(): void;
}

function HandleComponent() {
  const { theme } = useAppSelector((state) => state.global);
  return <View style={[styles.sheetHeader, { backgroundColor: theme.colors.primary }]} />;
}

export default function CreditSheet(props: ICreditsSheet) {
  const { open, dropzoneUser, onClose, onSuccess } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.credits);
  const global = useAppSelector((root) => root.global);
  const [mutationCreateOrder, createData] = useCreateOrderMutation();

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
    state.fields.amount.value,
    state.fields.message.value,
    state.fields.transactionType?.value,
    global.currentDropzoneId,
    mutationCreateOrder,
    dispatch,
    props,
  ]);
  const [keyboardVisible, setKeyboardVisible] = React.useState(false);
  const onKeyboardVisible = () => setKeyboardVisible(true);
  const onKeyboardHidden = () => setKeyboardVisible(false);

  React.useEffect(() => {
    Keyboard.addListener('keyboardDidShow', onKeyboardVisible);
    Keyboard.addListener('keyboardDidHide', onKeyboardHidden);

    return () => {
      Keyboard.removeListener('keyboardDidShow', onKeyboardVisible);
      Keyboard.removeListener('keyboardDidHide', onKeyboardHidden);
    };
  }, []);
  const sheetRef = React.useRef<BottomSheetModal>(null);

  const snapPoints = React.useMemo(() => [550], []);

  const memoizedClose = React.useMemo(() => onClose, [onClose]);

  const onDismiss = React.useCallback(() => {
    setTimeout(() => {
      requestAnimationFrame(() => memoizedClose());
    });
  }, [memoizedClose]);

  const show = () => {
    sheetRef.current?.present();
  };

  const hide = () => {
    sheetRef.current?.dismiss({ duration: 300 });
    setTimeout(onDismiss, 350);
  };

  React.useEffect(() => {
    if (open) {
      show();
      // sheetRef.current?.snapTo(snappingPoints?.length - 1, 300);
    } else {
      hide();
    }
    // Intentional to not open/close the sheet every time these change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onDismiss, open]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      onDismiss={onDismiss}
      index={0}
      backdropComponent={BottomSheetBackdrop}
      handleComponent={HandleComponent}
    >
      <View style={{ backgroundColor: 'white', flexGrow: 1 }} testID="credits-sheet">
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

        <BottomSheetScrollView
          style={{ flex: 1, flexGrow: 1, width: '100%', height: '100%' }}
          contentContainerStyle={[styles.sheet, { paddingBottom: keyboardVisible ? 400 : 80 }]}
        >
          <CreditsForm />
          <View style={styles.buttonContainer}>
            <Button
              onPress={onSave}
              loading={createData.loading}
              mode="contained"
              style={styles.button}
            >
              Save
            </Button>
          </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    borderRadius: 16,
    padding: 5,
  },
  buttonContainer: {
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sheet: {
    paddingBottom: 30,
    paddingHorizontal: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
  },
  sheetHeader: {
    elevation: 2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    backgroundColor: 'white',
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
});
