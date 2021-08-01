import { gql, useMutation } from '@apollo/client';
import * as React from 'react';
import { View, StyleSheet, Keyboard } from 'react-native';
import { omit } from 'lodash';
import { Button } from 'react-native-paper';
import { Tabs, TabScreen } from 'react-native-paper-tabs';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Mutation } from '../../../api/schema.d';
import { actions, useAppDispatch, useAppSelector } from '../../../state';
import ManifestGroupForm from '../../forms/manifest_group/ManifestGroupForm';
import UserListSelect from './UserListSelect';

interface IManifestUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess?(): void;
}

const MUTATION_CREATE_SLOTS = gql`
  mutation CreateSlot(
    $jumpTypeId: Int
    $extraIds: [Int!]
    $loadId: Int
    $ticketTypeId: Int
    $userGroup: [SlotUser!]!
  ) {
    createSlots(
      input: {
        attributes: {
          jumpTypeId: $jumpTypeId
          extraIds: $extraIds
          loadId: $loadId
          ticketTypeId: $ticketTypeId
          userGroup: $userGroup
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }

      load {
        id
        name
        loadNumber
        createdAt
        dispatchAt
        hasLanded
        maxSlots
        isFull
        isOpen
        plane {
          id
          name
        }
        gca {
          id
          user {
            id
            name
          }
        }
        pilot {
          id
          user {
            id
            name
          }
        }
        loadMaster {
          id
          user {
            id
            name
          }
        }
        slots {
          id
          createdAt
          user {
            id
            name
          }
          passengerName
          passengerExitWeight
          ticketType {
            id
            name
            isTandem
            altitude
          }
          jumpType {
            id
            name
          }
          extras {
            id
            name
          }
        }
      }
    }
  }
`;

export default function ManifestGroupDialog(props: IManifestUserDialog) {
  const { open, onClose, onSuccess } = props;
  const dispatch = useAppDispatch();
  const state = useAppSelector((root) => root.forms.manifestGroup);
  const globalState = useAppSelector((root) => root.global);
  const [mutationCreateSlots, mutationData] = useMutation<Mutation>(MUTATION_CREATE_SLOTS);
  const [tabIndex, setTabIndex] = React.useState(0);
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

  const validate = React.useCallback(() => {
    let hasErrors = false;
    if (!state.fields.jumpType.value?.id) {
      hasErrors = true;
      dispatch(
        actions.forms.manifestGroup.setFieldError(['jumpType', 'You must specify the type of jump'])
      );
    }

    if (!state.fields.ticketType.value?.id) {
      hasErrors = true;
      dispatch(
        actions.forms.manifestGroup.setFieldError([
          'ticketType',
          'You must select a ticket type to manifest',
        ])
      );
    }

    if (state.fields.ticketType.value?.isTandem) {
      const hasPassengers = state.fields.users?.value?.every(
        (slotUser) => !!slotUser.passengerName
      );

      if (!hasPassengers) {
        hasErrors = true;
        dispatch(
          actions.forms.manifestGroup.setFieldError([
            'users',
            'You cant manifest tandems without passengers',
          ])
        );
      }
    }

    return !hasErrors;
  }, [
    dispatch,
    state.fields.jumpType.value?.id,
    state.fields.ticketType.value?.id,
    state.fields.ticketType.value?.isTandem,
    state.fields.users,
  ]);
  const onManifest = React.useCallback(async () => {
    if (!validate()) {
      return;
    }
    try {
      const result = await mutationCreateSlots({
        variables: {
          jumpTypeId: Number(state.fields.jumpType.value?.id),
          ticketTypeId: Number(state.fields.ticketType.value?.id),
          extraIds: state.fields.extras?.value?.map(({ id }) => Number(id)),
          loadId: Number(state.fields.load.value?.id),
          userGroup: state.fields.users.value?.map((slotUserWithRig) =>
            omit(slotUserWithRig, ['rig'])
          ),
        },
      });

      result.data?.createSlots?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case 'jump_type':
            return dispatch(actions.forms.manifestGroup.setFieldError(['jumpType', message]));
          case 'load':
            return dispatch(actions.forms.manifestGroup.setFieldError(['load', message]));
          case 'credits':
          case 'extras':
          case 'extra_ids':
            return dispatch(actions.forms.manifestGroup.setFieldError(['extras', message]));
          case 'ticket_type':
            return dispatch(actions.forms.manifestGroup.setFieldError(['ticketType', message]));
          default:
            return null;
        }
      });
      if (result?.data?.createSlots?.errors?.length) {
        dispatch(
          actions.notifications.showSnackbar({
            message: result?.data?.createSlots?.errors[0],
            variant: 'error',
          })
        );
        return;
      }
      if (!result.data?.createSlots?.fieldErrors?.length) {
        requestAnimationFrame(() => onSuccess?.());
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
    mutationCreateSlots,
    onSuccess,
    state.fields.extras?.value,
    state.fields.jumpType.value?.id,
    state.fields.load.value?.id,
    state.fields.ticketType.value?.id,
    state.fields.users.value,
    validate,
  ]);

  const sheetRef = React.useRef<BottomSheetModal>(null);

  React.useEffect(() => {
    if (state.fields.ticketType?.value?.isTandem) {
      sheetRef?.current?.snapTo(0);
    }
  }, [state.fields.ticketType?.value?.isTandem]);

  const snapPoints = React.useMemo(() => [550], []);
  const memoizedClose = React.useCallback(() => {
    onClose();
    setTabIndex(0);
  }, [onClose]);

  const onDismiss = React.useCallback(() => {
    setTimeout(() => {
      requestAnimationFrame(() => memoizedClose());
    });
  }, [memoizedClose]);

  React.useEffect(() => {
    if (open) {
      sheetRef.current?.present();
      sheetRef.current?.snapTo(snapPoints?.length - 1, 300);
    } else {
      sheetRef.current?.dismiss(300);
      setTimeout(onDismiss, 350);
    }
  }, [memoizedClose, onDismiss, open, snapPoints?.length]);

  const HandleComponent = React.useMemo(
    () => () =>
      <View style={[styles.sheetHeader, { backgroundColor: globalState.theme.colors.primary }]} />,
    [globalState.theme.colors.primary]
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      index={0}
      onDismiss={onDismiss}
      backdropComponent={BottomSheetBackdrop}
      handleComponent={HandleComponent}
    >
      <View style={{ backgroundColor: 'white', flexGrow: 1 }} testID="manifest-group-sheet">
        <View pointerEvents={(state.fields.users?.value?.length || 0) > 0 ? undefined : 'none'}>
          <Tabs defaultIndex={tabIndex} mode="fixed" onChangeIndex={setTabIndex}>
            <TabScreen label="Create group">
              <View />
            </TabScreen>
            <TabScreen label="Configure jump">
              <View />
            </TabScreen>
          </Tabs>
        </View>

        {tabIndex === 0 ? (
          <View style={styles.userListContainer}>
            <UserListSelect onNext={() => setTabIndex(1)} />
          </View>
        ) : (
          <BottomSheetScrollView
            style={{ flex: 1, flexGrow: 1, width: '100%', height: '100%' }}
            contentContainerStyle={[styles.sheet, { paddingBottom: keyboardVisible ? 400 : 80 }]}
          >
            <ManifestGroupForm />
            <View style={styles.buttonContainer}>
              <Button
                onPress={onManifest}
                loading={mutationData.loading}
                mode="contained"
                style={styles.button}
              >
                Save
              </Button>
            </View>
          </BottomSheetScrollView>
        )}
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
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  userListContainer: {
    height: '100%',
    backgroundColor: 'white',
    width: '100%',
    padding: 16,
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
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
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
