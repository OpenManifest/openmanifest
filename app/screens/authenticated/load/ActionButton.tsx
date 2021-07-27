import * as React from 'react';
import { FAB, Portal } from 'react-native-paper';
import addMinutes from 'date-fns/addMinutes';

import useMutationUpdateLoad from '../../../api/hooks/useMutationUpdateLoad';
import useCurrentDropzone from '../../../api/hooks/useCurrentDropzone';

import { Load, Permission, LoadState } from '../../../api/schema.d';
import useRestriction from '../../../hooks/useRestriction';
import { actions, useAppDispatch } from '../../../state';

interface ILoadActionButtonProps {
  load: Load;
}

export default function ActionButton(props: ILoadActionButtonProps) {
  const dispatch = useAppDispatch();
  const [isExpanded, setExpanded] = React.useState(false);

  const { load } = props;

  const currentDropzone = useCurrentDropzone();
  const { currentUser } = currentDropzone;

  const mutationUpdateLoad = useMutationUpdateLoad({
    onSuccess: () => null,
    onError: (message) =>
      dispatch(actions.notifications.showSnackbar({ message, variant: 'error' })),
  });

  const updateCall = React.useCallback(
    async (minutes: number | null) => {
      const dispatchTime = !minutes ? null : addMinutes(new Date(), minutes).getTime() / 1000;

      await mutationUpdateLoad.mutate({
        id: Number(load.id),
        dispatchAt: dispatchTime ? Math.ceil(dispatchTime) : null,
        state: dispatchTime ? LoadState.BoardingCall : LoadState.Open,
      });
    },
    [mutationUpdateLoad, load]
  );

  const updateLoadState = React.useCallback(
    async (state: LoadState) => {
      await mutationUpdateLoad.mutate({
        id: Number(load.id),
        state,
        dispatchAt: null,
      });
    },
    [mutationUpdateLoad, load]
  );

  const onLanded = React.useCallback(async () => {
    await mutationUpdateLoad.mutate({
      id: Number(load.id),
      hasLanded: true,
      state: LoadState.Landed,
    });
  }, [mutationUpdateLoad, load]);

  const onManifest = React.useCallback(() => {
    if (!currentUser?.hasLicense) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: 'You need to select a license on your user profile',
          variant: 'warning',
        })
      );
    }

    if (!currentUser?.hasMembership) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: 'Your membership is out of date',
          variant: 'warning',
        })
      );
    }

    /*
    // Allow user to manifest with dropzone rigs
    if (!currentUser?.hasRigInspection) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: 'Your rig needs to be inspected before manifesting',
          variant: 'warning',
        })
      );
    }

    
    if (!currentUser?.hasReserveInDate) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: 'Your rig needs a reserve repack',
          variant: 'warning',
        })
      );
    }
    */

    if (!currentUser?.hasExitWeight) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: 'Update your exit weight on your profile before manifesting',
          variant: 'warning',
        })
      );
    }

    if (!currentUser?.hasCredits) {
      return dispatch(
        actions.notifications.showSnackbar({
          message: 'You have no credits on your account',
          variant: 'warning',
        })
      );
    }

    dispatch(actions.forms.manifest.setOpen(true));
    dispatch(actions.forms.manifest.setField(['dropzoneUser', currentUser]));
    dispatch(actions.forms.manifest.setField(['load', load]));
    return null;
  }, [currentUser, dispatch, load]);

  const canUpdateLoad = useRestriction(Permission.UpdateLoad);

  const canManifestSelf = useRestriction(Permission.CreateSlot);
  const canManifestGroup = useRestriction(Permission.CreateUserSlot);
  const canManifestGroupWithSelfOnly = useRestriction(Permission.CreateUserSlotWithSelf);

  const isOpen = [LoadState.Open, LoadState.BoardingCall].includes(load.state);
  const isFull = (load?.slots?.length || 0) >= (load?.maxSlots || load?.plane?.maxSlots || 0);
  const showManifestButton =
    isOpen &&
    !isFull &&
    canManifestSelf &&
    !load?.slots?.some((slot) => slot.dropzoneUser?.id === currentUser?.id);

  const showGroupIcon =
    (canManifestGroup || canManifestGroupWithSelfOnly) &&
    load?.state !== LoadState.Landed &&
    (!load?.dispatchAt || load.dispatchAt > new Date().getTime() / 1000);

  const createCallAction = React.useCallback(
    (minutes: number | null) => () => {
      setExpanded(false);
      updateCall(minutes);
    },
    [updateCall]
  );

  const callActions = [
    {
      label: '20 minute call',
      onPress: createCallAction(20),
      icon: 'airplane-takeoff',
    },
    {
      label: '15 minute call',
      onPress: createCallAction(15),
      icon: 'airplane-takeoff',
    },
    {
      label: '10 minute call',
      onPress: createCallAction(10),
      icon: 'airplane-takeoff',
    },
  ];

  const manifestActions = [
    !showManifestButton
      ? null
      : {
          label: 'Manifest me',
          icon: 'account',
          onPress: () => onManifest(),
        },
    !showGroupIcon
      ? null
      : {
          label: 'Manifest group',
          icon: 'account-group',
          onPress: () => {
            dispatch(actions.forms.manifestGroup.reset());
            dispatch(actions.forms.manifestGroup.setField(['load', load]));

            if (canManifestGroupWithSelfOnly && !canManifestGroup && currentUser) {
              // Automatically add current user to selection
              dispatch(actions.screens.manifest.setSelected([currentUser]));
              dispatch(actions.forms.manifestGroup.setDropzoneUsers([currentUser]));
            }

            dispatch(actions.forms.manifestGroup.setOpen(true));
            dispatch(actions.forms.manifestGroup.setField(['load', load]));
          },
        },
  ].filter(Boolean);

  const workflowActions = [
    ![LoadState.BoardingCall].includes(load.state)
      ? null
      : {
          label: 'Cancel boarding call',
          icon: 'airplane-off',
          onPress: createCallAction(null),
        },
    ![LoadState.Open].includes(load.state)
      ? null
      : {
          label: 'Cancel load',
          icon: 'delete-sweep',
          onPress: () => updateLoadState(LoadState.Cancelled),
        },
    ![LoadState.Cancelled].includes(load.state)
      ? null
      : {
          label: 'Re-open load',
          icon: 'undo',
          onPress: () => updateLoadState(LoadState.Open),
        },
    ![LoadState.BoardingCall, LoadState.InFlight].includes(load.state)
      ? null
      : {
          label: 'Mark as Landed',
          icon: 'airplane-landing',
          onPress: () => onLanded(),
        },
  ].filter(Boolean);

  const buttonActions = [
    ...(isOpen ? manifestActions : []),
    ...([LoadState.Open].includes(load?.state) ? callActions : []),
    ...(canUpdateLoad ? workflowActions : []),
  ];

  return (
    <Portal>
      <FAB.Group
        visible={!!buttonActions.length}
        open={isExpanded}
        icon={isExpanded ? 'close' : 'plus'}
        fabStyle={{
          marginLeft: 16,
          marginBottom: 32,
        }}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        actions={buttonActions}
        onStateChange={({ open }) => setExpanded(open)}
      />
    </Portal>
  );
}
