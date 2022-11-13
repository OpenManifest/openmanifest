import * as React from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Tabs, TabScreen } from 'react-native-paper-tabs';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useManifestGroupMutation } from 'app/api/reflection';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import DialogOrSheet from 'app/components/layout/DialogOrSheet';
import { DropzoneUserEssentialsFragment } from 'app/api/operations';
import { SlotUserWithRig } from 'app/components/forms/manifest_group/slice';
import { useNotifications } from 'app/providers/notifications';
import ManifestGroupForm from '../../forms/manifest_group/ManifestGroupForm';
import UserListSelect from './UserListSelect';

interface IManifestUserDialog {
  open?: boolean;
  onClose(): void;
  onSuccess?(): void;
}

export default function ManifestGroupDialog(props: IManifestUserDialog) {
  const { open, onClose, onSuccess } = props;
  const dispatch = useAppDispatch();
  const notify = useNotifications();
  const state = useAppSelector((root) => root.forms.manifestGroup);
  const [mutationCreateSlots, mutationData] = useManifestGroupMutation();
  const [tabIndex, setTabIndex] = React.useState(0);
  React.useEffect(() => {
    if (!state?.fields?.users?.value?.length) {
      setTabIndex(0);
    }
  }, [state?.fields?.users?.value?.length]);

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
  const onNext = React.useCallback(async () => {
    if (tabIndex === 0) {
      setTabIndex(1);
      return;
    }
    if (!validate() || !state.fields.users.value?.length) {
      return;
    }
    try {
      const result = await mutationCreateSlots({
        variables: {
          jumpType: state.fields.jumpType.value?.id,
          ticketType: state.fields.ticketType.value?.id,
          groupNumber: state.fields?.groupNumber?.value || null,
          extras: state.fields.extras?.value?.map(({ id }) => id),
          load: state.fields.load.value?.id,
          userGroup: state.fields.users.value?.map(
            ({ id, exitWeight, rigId, rig, passengerName, passengerExitWeight }) => ({
              id,
              rig: rigId?.toString() || rig?.id || undefined,
              exitWeight,
              passengerName,
              passengerExitWeight,
            })
          ),
        },
      });

      result.data?.createSlots?.fieldErrors?.map(({ field, message }) => {
        switch (field) {
          case 'jump_type':
          case 'jump_type_id':
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
        notify.error(result?.data?.createSlots?.errors[0]);
        return;
      }
      if (!result.data?.createSlots?.fieldErrors?.length) {
        requestAnimationFrame(() => onSuccess?.());
      }
    } catch (error) {
      if (error instanceof Error) {
        notify.error(error.message);
      }
    }
  }, [
    dispatch,
    mutationCreateSlots,
    notify,
    onSuccess,
    state.fields.extras?.value,
    state.fields?.groupNumber?.value,
    state.fields.jumpType.value?.id,
    state.fields.load.value?.id,
    state.fields.ticketType.value?.id,
    state.fields.users.value,
    tabIndex,
    validate,
  ]);

  const sheetRef = React.useRef<BottomSheetModal>(null);

  React.useEffect(() => {
    if (state.fields.ticketType?.value?.isTandem) {
      sheetRef?.current?.snapToIndex(0);
    }
  }, [state.fields.ticketType?.value?.isTandem]);

  const snapPoints = React.useMemo(() => [550], []);
  const memoizedClose = React.useCallback(() => {
    onClose();
    dispatch(actions.forms.manifestGroup.reset());
    setTabIndex(0);
  }, [dispatch, onClose]);

  const onDismiss = React.useCallback(() => {
    setTimeout(() => {
      requestAnimationFrame(() => memoizedClose());
    });
  }, [memoizedClose]);

  const onSelect = React.useCallback(
    (dropzoneUser: DropzoneUserEssentialsFragment) => {
      if (tabIndex === 0) {
        if (!dropzoneUser) {
          return;
        }
        dispatch(actions.forms.manifestGroup.setDropzoneUsers([dropzoneUser]));
      }
    },
    [dispatch, tabIndex]
  );

  React.useEffect(() => {
    if (open) {
      sheetRef.current?.present();
      sheetRef.current?.snapToIndex((snapPoints?.length || 1) - 1, { duration: 300 });
    } else {
      sheetRef.current?.dismiss({ duration: 300 });
      setTimeout(onDismiss, 350);
    }
  }, [memoizedClose, onDismiss, open, snapPoints?.length]);

  const theme = useTheme();
  const handleStyles = React.useMemo(
    () => ({ backgroundColor: theme.colors.primary }),
    [theme.colors.primary]
  );

  const StickyHeader = React.useCallback(
    () => (
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
    ),
    [state.fields.users?.value?.length, tabIndex]
  );

  console.log('Manifest Group', open);
  return (
    <DialogOrSheet
      loading={mutationData.loading}
      {...{ open, handleStyles }}
      buttonLabel={tabIndex === 1 ? 'Manifest' : 'Next'}
      onClose={onDismiss}
      buttonAction={onNext}
      handle={<StickyHeader />}
      scrollable
    >
      {tabIndex === 0 ? (
        <View style={{ paddingHorizontal: 8, marginTop: 8, marginBottom: 100 }}>
          <UserListSelect
            hideButton
            scrollable={false}
            {...{ onSelect, value: state.fields.users.value as SlotUserWithRig[] }}
          />
        </View>
      ) : (
        <ManifestGroupForm />
      )}
    </DialogOrSheet>
  );
}
