import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { LoadDetailsFragment } from 'app/api/operations';

import { useOperatorContext, useLoadContext, useManifestContext } from 'app/providers';

import { Permission, LoadState } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorToday, useOperatorTimeZone } from 'app/hooks/useOperatorToday';
import { dateInZone } from 'app/utils/operatorTime';
import { formatCall } from 'app/i18n/format';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';

interface ILoadActionButtonProps {
  load: LoadDetailsFragment;
}

export default function ActionButton(props: ILoadActionButtonProps) {
  const { dialogs } = useManifestContext();
  const {
    dialogs: { timepicker },
    load: { cancel, complete, updateLoadState, createVehicleDispatchAction },
  } = useLoadContext();
  const [isExpanded, setExpanded] = React.useState(false);

  const { load } = props;

  const { operator: currentOperator } = useOperatorContext();
  const { currentUser } = currentOperator;

  const theme = useTheme();
  const canUpdateLoad = useRestriction(Permission.UpdateLoad);

  const canManifestSelf = useRestriction(Permission.CreateSlot);
  const canManifestGroup = useRestriction(Permission.CreateUserSlot);
  const canManifestGroupWithSelfOnly = useRestriction(Permission.CreateUserSlotWithSelf);

  const isOpen = [LoadState.Open, LoadState.Boarding].includes(load.state);
  const isFull = (load?.slots?.length || 0) >= (load?.maxSlots || load?.vehicle?.capacity || 0);
  const showManifestButton =
    isOpen &&
    !isFull &&
    canManifestSelf &&
    !load?.slots?.some((slot) => slot.membership?.id === currentUser?.id);

  const showGroupIcon =
    (canManifestGroup || canManifestGroupWithSelfOnly) &&
    load?.state !== LoadState.Completed &&
    (!load?.dispatchAt || load.dispatchAt > new Date().getTime() / 1000);

  // The calls the operator offers (the template's until it sets its own); with none, the load departs directly
  const callMinutes = currentOperator.operator?.callScheduleMinutes ?? [];
  const callActions = callMinutes.length
    ? [
        {
          label: 'Custom call',
          onPress: timepicker.open,
          icon: 'airplane-takeoff',
        },
        ...callMinutes.map((minutes) => ({
          label: formatCall(minutes),
          onPress: createVehicleDispatchAction(minutes),
          icon: 'airplane-takeoff',
        })),
      ]
    : [
        {
          label: 'Depart now',
          onPress: () => updateLoadState(LoadState.Departed),
          icon: 'airplane-takeoff',
        },
      ];

  // The load's day at the operator, not on this device
  const today = useOperatorToday();
  const timeZone = useOperatorTimeZone();
  const isToday = dateInZone(load.createdAt, timeZone) === today;

  const manifestActions = [
    !showManifestButton || !isToday
      ? null
      : {
          label: 'Manifest me',
          icon: 'account',
          onPress: () => dialogs.manifestUser.open({ load, slot: { membership: currentUser } }),
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
    ![LoadState.Boarding].includes(load.state)
      ? null
      : {
          label: 'Cancel boarding call',
          icon: 'airplane-off',
          onPress: createVehicleDispatchAction(null),
        },
    ![LoadState.Open].includes(load.state)
      ? null
      : {
          label: 'Cancel load',
          icon: 'delete-sweep',
          onPress: cancel,
        },
    ![LoadState.Cancelled, LoadState.Completed].includes(load.state) || !isToday
      ? null
      : {
          label: 'Re-open load',
          icon: 'undo',
          onPress: () => updateLoadState(LoadState.Open),
        },
    ![LoadState.Boarding, LoadState.Departed].includes(load.state)
      ? null
      : {
          label: 'Mark as Landed',
          icon: 'airplane-landing',
          onPress: complete,
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
