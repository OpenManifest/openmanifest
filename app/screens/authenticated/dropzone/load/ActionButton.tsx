import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { LoadDetailsFragment } from 'app/api/operations';

import { useDropzoneContext, useLoadContext, useManifestContext } from 'app/providers';

import { Permission, LoadState } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useDropzoneToday, useDropzoneTimeZone } from 'app/hooks/useDropzoneToday';
import { dateInZone } from 'app/utils/dropzoneTime';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';

interface ILoadActionButtonProps {
  load: LoadDetailsFragment;
}

export default function ActionButton(props: ILoadActionButtonProps) {
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

  // The load's day at the dropzone, not on this device
  const today = useDropzoneToday();
  const timeZone = useDropzoneTimeZone();
  const isToday = dateInZone(load.createdAt, timeZone) === today;

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
          onPress: () => dialogs.manifestGroup.open({ load }),
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

  // Not in a Portal: the group fills the screen area above the tab bar, which already covers the bottom inset
  return (
    <FAB.Group
      testID="load-actions-primary-action"
      visible={!!buttonActions.length}
      open={isExpanded}
      icon={isExpanded ? 'close' : 'plus'}
      style={styles.group}
      fabStyle={{ backgroundColor: theme.colors.primary }}
      // @ts-ignore
      actions={buttonActions.map((action) => ({
        ...action,
        labelMaxFontSizeMultiplier: CHROME_MAX_FONT_SIZE_MULTIPLIER,
      }))}
      onStateChange={({ open }) => setExpanded(open)}
    />
  );
}

const styles = StyleSheet.create({
  group: { paddingBottom: 0 },
});
