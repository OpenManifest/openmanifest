import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import ProgressBar from 'app/components/ProgressBar';
import differenceInMinutes from 'date-fns/differenceInMinutes';

import { SlotDetailsFragment } from 'app/api/operations';
import {
  useOperatorContext,
  useLoadContext,
  useManifestContext,
  withLoadContext,
} from 'app/providers';
import LoadCrewChips from 'app/components/chips/LoadCrewChips';
import VehicleChip from 'app/components/chips/VehicleChip';

import { LoadState, Permission } from 'app/api/schema.d';
import { formatCall } from 'app/i18n/format';
import useRestriction from 'app/hooks/useRestriction';
import { useAuthenticatedNavigation } from 'app/screens/authenticated/useAuthenticatedNavigation';
import LoadSlotTable from 'app/components/slots_table/Table';
import { SlotFields } from 'app/components/slots_table/UserRow';
import { useNotifications } from 'app/providers/notifications';
import LoadingCard from './Loading';
import { Button, Card, IconButton, Menu, Row, Text, useTheme } from 'app/ui';

interface ILoadCardLarge {
  controlsVisible: boolean;
  onManifestGroup(): void;
  onSlotGroupPress(slots: SlotDetailsFragment[]): void;
  onSlotPress(slot: SlotDetailsFragment): void;
  onManifest(): void;
}

function LoadCard(props: ILoadCardLarge) {
  const { onManifest, onManifestGroup, controlsVisible, onSlotGroupPress, onSlotPress } = props;
  const theme = useTheme();
  const { t } = useTranslation(['common', 'terms']);
  const [isExpanded, setExpanded] = React.useState(false);
  const {
    manifest: { deleteSlot },
  } = useManifestContext();
  const [deletingSlot, setDeletingSlot] = React.useState(false);
  const notify = useNotifications();

  const {
    load: {
      load,
      loading,
      refetch,
      updateCrew,
      updateVehicle,
      dispatchInMinutes,
      updateLoadState,
      complete,
    },
  } = useLoadContext();
  const { operator: currentOperator } = useOperatorContext();
  // The calls the operator offers; with none, the load departs directly
  const callMinutes = currentOperator.operator?.callScheduleMinutes ?? [];
  const onDeleteSlot = React.useCallback(
    async (slot: SlotDetailsFragment) => {
      try {
        setDeletingSlot(true);

        const response = await deleteSlot({
          id: Number(slot.id),
        });

        if ('error' in response && response.error) {
          notify.error(
            response?.error ||
              t('common:legacy.loadCard.notTakenOff', {
                name: slot.membership?.user?.name,
                load: t('terms:load', { count: 1 }).toLowerCase(),
                number: load?.loadNumber,
              })
          );
        } else if ('slot' in response && slot?.id) {
          notify.error(
            t('common:legacy.loadCard.takenOff', {
              name: response.slot?.membership?.user?.name || t('common:legacy.loadCard.someone'),
              load: t('terms:load', { count: 1 }).toLowerCase(),
              number: load?.loadNumber,
            })
          );
        }
      } finally {
        setDeletingSlot(false);
      }
    },
    [deleteSlot, load?.loadNumber, notify, t]
  );

  const navigation = useAuthenticatedNavigation();
  const canUpdateLoad = useRestriction(Permission.UpdateLoad);

  const canManifestSelf = useRestriction(Permission.CreateSlot);
  const canManifestGroup = useRestriction(Permission.CreateUserSlot);
  const canManifestGroupWithSelfOnly = useRestriction(Permission.CreateUserSlotWithSelf);

  const showManifestButton = canManifestSelf && load?.isOpen && !load?.isFull;

  React.useEffect(() => {
    if (load?.maxSlots && load?.maxSlots < 5) {
      setExpanded(true);
    }
  }, [load?.maxSlots]);

  const showGroupIcon =
    controlsVisible &&
    (canManifestGroup || canManifestGroupWithSelfOnly) &&
    !load?.hasCompleted &&
    (!load?.dispatchAt || load.dispatchAt > new Date().getTime() / 1000);

  if (loading) {
    return <LoadingCard />;
  }
  const loadTitle = `Load ${load?.loadNumber || 0}`;
  return (
    <View
      testID="load-card"
      style={{ margin: theme.space.lg, opacity: load?.hasCompleted ? 0.5 : 1.0 }}
    >
      <Card variant="raised" padding="none">
        <View style={{ padding: theme.space.lg, paddingBottom: 0 }}>
          <Row align="center" gap="sm">
            <View style={{ flex: 1, gap: theme.space.xs }}>
              <Text variant="title" testID="title">
                {loadTitle}
              </Text>
              {load?.name ? <Text tone="muted">{load.name}</Text> : null}
            </View>
            {showGroupIcon && (
              <IconButton
                icon="account-group"
                aria-label={t('common:legacy.loadCard.manifestGroup')}
                testID="manifest-group-button"
                onPress={() => onManifestGroup?.()}
              />
            )}
          </Row>
        </View>
        <ProgressBar visible={loading || deletingSlot} />
        <View
          style={{
            marginVertical: theme.space.sm,
            height: isExpanded || !controlsVisible ? undefined : 300,
            overflow: 'hidden',
          }}
        >
          <View style={{ flexDirection: 'row', paddingHorizontal: theme.space.sm }}>
            <ScrollView style={{ height: 32 }} horizontal showsHorizontalScrollIndicator={false}>
              <VehicleChip
                small
                value={load?.vehicle}
                onSelect={async (vehicle) => {
                  if ((load?.slots?.length || 0) > (vehicle.capacity || 0)) {
                    const diff = (load?.slots?.length || 0) - (vehicle.capacity || 0);

                    notify.info(
                      t('common:legacy.loadCard.tooMany', {
                        count: diff,
                        vehicle: t('terms:vehicle', { count: 1 }).toLowerCase(),
                      })
                    );
                  } else {
                    await updateVehicle(vehicle);
                    refetch();
                  }
                }}
              />
              <LoadCrewChips small load={load} onSelect={updateCrew} />
            </ScrollView>
          </View>
          <LoadSlotTable
            {...{ load, loading, onSlotPress, onSlotGroupPress }}
            onDeletePress={onDeleteSlot}
            onAvailableSlotPress={() =>
              load?.id &&
              navigation.navigate('Manifest', {
                screen: 'LoadScreen',
                params: { loadId: load?.id },
              })
            }
            onSlotPress={onSlotPress}
            fields={[SlotFields.ActivityType].filter(Boolean) as SlotFields[]}
          />
        </View>
        {!!load?.dispatchAt && load?.dispatchAt > new Date().getTime() / 1000 && (
          <View
            style={{ backgroundColor: theme.colour.status.boarding.bg, padding: theme.space.sm }}
          >
            <Text tone="boarding">
              {t('common:legacy.loadCard.departsIn', {
                minutes: differenceInMinutes(new Date(), (load?.dispatchAt as number) * 1000),
              })}
            </Text>
          </View>
        )}

        {!controlsVisible ? null : (
          <View style={{ padding: theme.space.sm }}>
            <Row gap="sm" align="center" wrap>
              {load?.maxSlots && load?.maxSlots < 5 ? null : (
                <Button
                  variant="tertiary"
                  onPress={() => setExpanded(!isExpanded)}
                  testID={isExpanded ? 'show-less' : 'show-more'}
                  label={
                    isExpanded
                      ? t('common:legacy.loadCard.showLess')
                      : t('common:legacy.loadCard.showMore')
                  }
                />
              )}
              <View style={{ flexGrow: 1 }} />
              {!canUpdateLoad || !!load?.hasCompleted ? null : load?.dispatchAt ? (
                <Button
                  variant="secondary"
                  onPress={() => dispatchInMinutes(null)}
                  testID="dispatch-cancel"
                  label={t('common:legacy.cancel')}
                />
              ) : (
                <Menu
                  label={t('common:legacy.dispatch.submit')}
                  trigger={
                    <Button
                      variant="secondary"
                      testID="dispatch-button"
                      label={t('common:legacy.dispatch.submit')}
                    />
                  }
                  items={
                    callMinutes.length
                      ? callMinutes.map((minutes) => ({
                          label: formatCall(minutes),
                          testID: 'dispatch-call',
                          onPress: () => dispatchInMinutes(minutes),
                        }))
                      : [
                          {
                            label: t('common:legacy.loadCard.departNow'),
                            testID: 'dispatch-depart',
                            onPress: () => updateLoadState(LoadState.Departed),
                          },
                        ]
                  }
                />
              )}

              {load?.hasCompleted ? null : load?.dispatchAt &&
                load.dispatchAt < new Date().getTime() / 1000 &&
                canUpdateLoad ? (
                <Button
                  label={t('common:legacy.loadCard.complete')}
                  onPress={() => {
                    if (!load?.loadMaster?.id) {
                      return notify.info(t('common:legacy.loadCard.needLoadMaster'));
                    }

                    if (!load?.pilot?.id) {
                      return notify.info(t('common:legacy.loadCard.needPilot'));
                    }
                    return complete();
                  }}
                />
              ) : (
                <Button
                  testID="manifest-button"
                  label={t('common:legacy.loadCard.manifest')}
                  onPress={() => onManifest()}
                  disabled={
                    !showManifestButton ||
                    Boolean(load?.dispatchAt && load.dispatchAt < new Date().getTime() / 1000)
                  }
                />
              )}
            </Row>
          </View>
        )}
      </Card>
    </View>
  );
}

export default withLoadContext(LoadCard);
