import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { LoadDetailsFragment } from 'app/api/operations';

import { useOperatorContext, useLoadContext, useManifestContext } from 'app/providers';

import { Permission, LoadState } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorToday, useOperatorTimeZone } from 'app/hooks/useOperatorToday';
import { dateInZone } from 'app/utils/operatorTime';
import { formatCall } from 'app/i18n/format';
import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import { Button, Menu, type MenuItem } from 'app/ui';
import { useVehicleGlyphs } from 'app/features/board/VehicleIcon';

interface ILoadActionButtonProps {
  load: LoadDetailsFragment;
}

export default function ActionButton(props: ILoadActionButtonProps) {
  const { dialogs } = useManifestContext();
  const {
    dialogs: { timepicker },
    load: { cancel, complete, updateLoadState, createVehicleDispatchAction },
  } = useLoadContext();
  const { t } = useTranslation('common');

  const { load } = props;

  const { operator: currentOperator } = useOperatorContext();
  const { currentUser } = currentOperator;
  const glyphs = useVehicleGlyphs(load?.vehicle?.kind);

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
  const depart = glyphs.motion('depart');
  const callActions = callMinutes.length
    ? [
        {
          label: 'Custom call',
          onPress: timepicker.open,
          icon: depart,
        },
        ...callMinutes.map((minutes) => ({
          label: formatCall(minutes),
          onPress: createVehicleDispatchAction(minutes),
          icon: depart,
        })),
      ]
    : [
        {
          label: 'Depart now',
          onPress: () => updateLoadState(LoadState.Departed),
          icon: depart,
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
          label: 'Cancel boarding',
          icon: glyphs.motion('none'),
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
          label: 'Mark as completed',
          icon: glyphs.motion('land'),
          onPress: complete,
        },
  ].filter(Boolean);

  const buttonActions = [
    ...(isOpen ? manifestActions : []),
    ...(canUpdateLoad && [LoadState.Open].includes(load?.state) && isToday ? callActions : []),
    ...(canUpdateLoad ? workflowActions : []),
  ];

  const items = buttonActions.filter(Boolean) as MenuItem[];
  if (!items.length) return null;

  return (
    <FloatingActionArea>
      <Menu
        label={t('legacy.loadActions')}
        items={items}
        trigger={
          <Button
            testID="load-actions-primary-action"
            icon="plus"
            label={t('legacy.loadActions')}
          />
        }
      />
    </FloatingActionArea>
  );
}
