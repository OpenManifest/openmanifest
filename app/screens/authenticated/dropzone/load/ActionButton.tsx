import * as React from 'react';
import { FAB, Portal, useTheme } from 'react-native-paper';
import { LoadDetailsFragment } from 'app/api/operations';

import { useDropzoneContext, useLoadContext, useManifestContext } from 'app/providers';

import { Permission, LoadState } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { actions, useAppDispatch } from 'app/state';
import isSameDay from 'date-fns/isSameDay';
import { parseISO } from 'date-fns';

interface ILoadActionButtonProps {
  load: LoadDetailsFragment;
}

export default function ActionButton(props: ILoadActionButtonProps) {
  const dispatch = useAppDispatch();
  const { dialogs } = useManifestContext();
  const {
    dialogs: { timepicker },
    load: { cancel, markAsLanded, updateLoadState, createAircraftDispatchAction },
  } = useLoadContext();
  const [isExpanded, setExpanded] = React.useState(false);

  const { load } = props;

  const { dropzone: currentDropzone } = useDropzoneContext();
  const { currentUser } = currentDropzone;

  const theme = useTheme();
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

  const callActions = [
    {
      label: 'Custom call',
      onPress: timepicker.open,
      icon: 'airplane-takeoff',
    },
    {
      label: '20 minute call',
      onPress: createAircraftDispatchAction(20),
      icon: 'airplane-takeoff',
    },
    {
      label: '15 minute call',
      onPress: createAircraftDispatchAction(15),
      icon: 'airplane-takeoff',
    },
    {
      label: '10 minute call',
      onPress: createAircraftDispatchAction(10),
      icon: 'airplane-takeoff',
    },
  ];

  const isToday = isSameDay(new Date(), parseISO(load.createdAt));

  const manifestActions = [
    !showManifestButton || !isToday
      ? null
      : {
          label: 'Manifest me',
          icon: 'account',
          onPress: () => dialogs.manifestUser.open({ load, slot: { dropzoneUser: currentUser } }),
        },
    !showGroupIcon || !isToday
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
          onPress: createAircraftDispatchAction(null),
        },
    ![LoadState.Open].includes(load.state)
      ? null
      : {
          label: 'Cancel load',
          icon: 'delete-sweep',
          onPress: cancel,
        },
    ![LoadState.Cancelled, LoadState.Landed].includes(load.state) || !isToday
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
          onPress: markAsLanded,
        },
  ].filter(Boolean);

  const buttonActions = [
    ...(isOpen ? manifestActions : []),
    ...(canUpdateLoad && [LoadState.Open].includes(load?.state) && isToday ? callActions : []),
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
          marginBottom: 100,
          backgroundColor: theme.colors.primary,
        }}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        actions={buttonActions}
        onStateChange={({ open }) => setExpanded(open)}
      />
    </Portal>
  );
}
