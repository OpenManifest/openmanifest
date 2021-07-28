import { gql, useMutation } from '@apollo/client';
import * as React from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { Button } from 'react-native-paper';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';

import { Tabs, TabScreen } from 'react-native-paper-tabs';
import { DropzoneUser, Mutation } from '../../../api/schema.d';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import CreditsForm from '../../forms/credits/CreditsForm';

interface ICreditsSheet {
  open?: boolean;
  dropzoneUser?: DropzoneUser;
  onClose(): void;
  onSuccess(): void;
}

const MUTATION_CREATE_TRANSACTION = gql`
  mutation CreateTransaction(
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

export default function CreditSheet(props: ICreditsSheet) {
  const { open, dropzoneUser, onClose } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.credits);
  const global = useAppSelector((root) => root.global);
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
          dropzoneUserId: Number(dropzoneUser?.id),
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
    validate,
    mutationCreateTransaction,
    state.fields.amount.value,
    state.fields.message.value,
    state.fields.status.value,
    state.original?.id,
    dropzoneUser?.id,
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
    sheetRef.current?.dismiss(300);
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

  const HandleComponent = React.useMemo(
    () => () =>
      <View style={[styles.sheetHeader, { backgroundColor: global.theme.colors.primary }]} />,
    [global.theme.colors.primary]
  );

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
                  'status',
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
