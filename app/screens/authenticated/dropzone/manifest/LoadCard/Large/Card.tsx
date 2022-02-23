import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  Button,
  Card,
  DataTable,
  IconButton,
  Paragraph,
  ProgressBar,
  Text,
} from 'react-native-paper';
import addMinutes from 'date-fns/addMinutes';
import differenceInMinutes from 'date-fns/differenceInMinutes';

import { useLoadQuery } from 'app/api/reflection';
import {
  DropzoneUserEssentialsFragment,
  LoadDetailsFragment,
  PlaneEssentialsFragment,
  SlotDetailsFragment,
  SlotEssentialsFragment,
} from 'app/api/operations';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import GCAChip from 'app/components/chips/GcaChip';
import LoadMasterChip from 'app/components/chips/LoadMasterChip';
import PilotChip from 'app/components/chips/PilotChip';
import PlaneChip from 'app/components/chips/PlaneChip';
import Menu, { MenuItem } from 'app/components/popover/Menu';

import { View } from 'app/components/Themed';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import SwipeActions from 'app/components/layout/SwipeActions';
import useMutationUpdateLoad from 'app/api/hooks/useMutationUpdateLoad';
import useMutationDeleteSlot from 'app/api/hooks/useMutationDeleteSlot';
import { useAuthenticatedNavigation } from 'app/screens/authenticated/useAuthenticatedNavigation';
import LoadingCard from './Loading';

interface ILoadCardLarge {
  load: LoadDetailsFragment;
  controlsVisible: boolean;
  onManifestGroup(): void;
  onSlotGroupPress(slots: SlotEssentialsFragment[]): void;
  onSlotPress(slot: SlotEssentialsFragment): void;
  onManifest(): void;
}

export default function LoadCard(props: ILoadCardLarge) {
  const {
    load: initialRecord,
    onManifest,
    onManifestGroup,
    controlsVisible,
    onSlotGroupPress,
    onSlotPress,
  } = props;
  const state = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();
  const [isExpanded, setExpanded] = React.useState(false);
  const [isDispatchOpen, setDispatchOpen] = React.useState(false);

  const { data, loading, refetch } = useLoadQuery({
    variables: {
      id: Number(initialRecord.id),
    },
    onError: console.error,
  });
  const load = React.useMemo(() => data?.load, [data?.load]);
  const currentDropzone = useCurrentDropzone();
  const { currentUser } = currentDropzone;

  const mutationUpdateLoad = useMutationUpdateLoad({
    onSuccess: () =>
      dispatch(
        actions.notifications.showSnackbar({
          message: `Load #${load?.loadNumber} updated`,
          variant: 'success',
        })
      ),
    onError: (message) =>
      dispatch(
        actions.notifications.showSnackbar({
          message,
          variant: 'error',
        })
      ),
  });
  const mutationDeleteSlot = useMutationDeleteSlot({
    onSuccess: (payload) =>
      dispatch(
        actions.notifications.showSnackbar({
          message: `${payload.slot?.dropzoneUser?.user?.name || 'User'} has been taken off load #${
            load?.loadNumber
          }`,
          variant: 'success',
        })
      ),
    onError: (message) =>
      dispatch(
        actions.notifications.showSnackbar({
          message,
          variant: 'error',
        })
      ),
  });

  const onDeleteSlot = React.useCallback(
    async (slot: SlotDetailsFragment) => {
      await mutationDeleteSlot.mutate({
        id: Number(slot.id),
      });
    },
    [mutationDeleteSlot]
  );

  const updatePilot = React.useCallback(
    async (pilot: DropzoneUserEssentialsFragment) => {
      if (!load?.id) {
        return;
      }
      await mutationUpdateLoad.mutate({
        id: Number(load.id),
        pilotId: Number(pilot.id),
      });
    },
    [mutationUpdateLoad, load?.id]
  );

  const updateGCA = React.useCallback(
    async (gca: DropzoneUserEssentialsFragment) => {
      if (!load?.id) {
        return;
      }
      await mutationUpdateLoad.mutate({
        id: Number(load.id),
        gcaId: Number(gca.id),
      });
    },
    [mutationUpdateLoad, load?.id]
  );

  const updatePlane = React.useCallback(
    async (plane: PlaneEssentialsFragment) => {
      if (!load?.id) {
        return;
      }
      await mutationUpdateLoad.mutate({
        id: Number(load.id),
        planeId: Number(plane.id),
      });
    },
    [load?.id, mutationUpdateLoad]
  );

  const updateLoadMaster = React.useCallback(
    async (lm: DropzoneUserEssentialsFragment) => {
      if (!load?.id) {
        return;
      }
      await mutationUpdateLoad.mutate({
        id: Number(load.id),
        loadMasterId: Number(lm.id),
      });
    },
    [load?.id, mutationUpdateLoad]
  );

  const updateCall = React.useCallback(
    async (minutes: number | null) => {
      if (!load?.id) {
        return;
      }
      const dispatchTime = !minutes ? null : addMinutes(new Date(), minutes).getTime() / 1000;

      await mutationUpdateLoad.mutate({
        id: Number(load.id),
        dispatchAt: dispatchTime ? Math.ceil(dispatchTime) : null,
      });
    },
    [load?.id, mutationUpdateLoad]
  );

  const onLanded = React.useCallback(async () => {
    if (!load?.id) {
      return;
    }
    await mutationUpdateLoad.mutate({
      id: Number(load.id),
      hasLanded: true,
    });
  }, [load?.id, mutationUpdateLoad]);

  const navigation = useAuthenticatedNavigation();
  const canUpdateLoad = useRestriction(Permission.UpdateLoad);

  const canEditSelf = useRestriction(Permission.UpdateSlot);
  const canEditOthers = useRestriction(Permission.UpdateUserSlot);

  const canRemoveSelf = useRestriction(Permission.DeleteSlot);
  const canRemoveOthers = useRestriction(Permission.DeleteUserSlot);

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
    !load?.hasLanded &&
    (!load?.dispatchAt || load.dispatchAt > new Date().getTime() / 1000);

  if (loading) {
    return <LoadingCard />;
  }
  return (
    <Card
      testID="load-card"
      style={{ margin: 16, opacity: load?.hasLanded ? 0.5 : 1.0 }}
      elevation={3}
    >
      <Card.Title
        style={{ justifyContent: 'space-between' }}
        title={
          <View
            style={{
              width: '100%',
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'transparent',
            }}
          >
            <Text testID="title">{`Load ${load?.loadNumber || 0}`}</Text>
            <View style={{ flexGrow: 1 }} />
            {showGroupIcon && (
              <IconButton
                icon="account-group"
                testID="manifest-group-button"
                onPress={() => {
                  dispatch(actions.forms.manifestGroup.reset());
                  dispatch(actions.forms.manifestGroup.setField(['load', load]));

                  if (canManifestGroupWithSelfOnly && !canManifestGroup && currentUser) {
                    // Automatically add current user to selection
                    dispatch(actions.screens.manifest.setSelected([currentUser]));
                    dispatch(actions.forms.manifestGroup.setDropzoneUsers([currentUser]));
                  }

                  if (onManifestGroup) {
                    onManifestGroup();
                  }
                }}
              />
            )}
          </View>
        }
        subtitle={load?.name}
      />
      <ProgressBar
        visible={loading || mutationUpdateLoad.loading || mutationDeleteSlot.loading}
        color={state.theme.colors.primary}
      />
      <Card.Content
        style={{
          marginVertical: 8,
          height: isExpanded || !controlsVisible ? undefined : 300,
          overflow: 'hidden',
        }}
      >
        <View style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ backgroundColor: 'transparent' }}
          >
            <PlaneChip
              value={load?.plane}
              onSelect={async (plane) => {
                if ((load?.slots?.length || 0) > (plane.maxSlots || 0)) {
                  const diff = (load?.slots?.length || 0) - (plane.maxSlots || 0);

                  dispatch(
                    actions.notifications.showSnackbar({
                      message: `You need to take ${diff} people off the load to fit on this plane`,
                      variant: 'info',
                    })
                  );
                } else {
                  await updatePlane(plane);
                  refetch();
                }
              }}
            />
            <GCAChip value={load?.gca} onSelect={updateGCA} />
            <PilotChip value={load?.pilot} onSelect={updatePilot} />
            <LoadMasterChip
              value={load?.loadMaster}
              slots={load?.slots || []}
              onSelect={updateLoadMaster}
            />
          </ScrollView>
        </View>
        <DataTable>
          <DataTable.Header style={{ width: '100%' }}>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title numeric>Jump type</DataTable.Title>
            <DataTable.Title numeric>Altitude</DataTable.Title>
          </DataTable.Header>
          {load?.slots?.map((slot) => {
            const slotGroup = load?.slots?.filter(
              ({ groupNumber }) => groupNumber && groupNumber === slot.groupNumber
            );
            const isCurrentUser = slot?.dropzoneUser?.id === currentUser?.id;

            return (
              <SwipeActions
                disabled={(isCurrentUser && !canRemoveSelf) || (!isCurrentUser && !canRemoveOthers)}
                key={`slot-${slot.id}`}
                rightAction={{
                  label: 'Delete',
                  backgroundColor: 'red',
                  onPress: () => onDeleteSlot(slot),
                }}
              >
                <DataTable.Row
                  testID="slot-row"
                  disabled={!!load?.hasLanded}
                  onPress={() => {
                    if (slot.dropzoneUser?.id === currentUser?.id) {
                      if (canEditSelf) {
                        if (slotGroup?.length) {
                          onSlotGroupPress(slotGroup);
                        } else {
                          onSlotPress(slot);
                        }
                      }
                    } else if (canEditOthers) {
                      if (slotGroup?.length) {
                        onSlotGroupPress(slotGroup);
                      } else {
                        onSlotPress(slot);
                      }
                    }
                  }}
                  pointerEvents="none"
                >
                  <DataTable.Cell>
                    <Paragraph style={styles.slotText}>{slot?.dropzoneUser?.user?.name}</Paragraph>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Paragraph style={styles.slotText}>{slot?.jumpType?.name}</Paragraph>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                    <Paragraph style={styles.slotText}>
                      {(slot?.ticketType?.altitude || 14000) / 1000}k
                    </Paragraph>
                  </DataTable.Cell>
                </DataTable.Row>

                {slot?.ticketType?.isTandem && (
                  <DataTable.Row
                    testID="slot-row"
                    disabled={!!load?.hasLanded}
                    pointerEvents="none"
                  >
                    <DataTable.Cell>
                      <Paragraph style={styles.slotText}>{slot?.passengerName}</Paragraph>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Paragraph style={styles.slotText}>Passenger</Paragraph>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Paragraph style={styles.slotText}>
                        {(slot?.ticketType?.altitude || 14000) / 1000}k
                      </Paragraph>
                    </DataTable.Cell>
                  </DataTable.Row>
                )}
              </SwipeActions>
            );
          })}
          {Array.from({ length: load?.availableSlots || 0 }, (v, i) => i).map((i) => (
            <DataTable.Row
              key={`${load?.id}-empty-slot-${i}`}
              testID="slot-row"
              onPress={() =>
                load?.id &&
                navigation.navigate('Manifest', {
                  screen: 'LoadScreen',
                  params: { loadId: load?.id },
                })
              }
            >
              <DataTable.Cell>
                <Paragraph style={styles.slotText}>- Available -</Paragraph>
              </DataTable.Cell>
              <DataTable.Cell numeric>-</DataTable.Cell>
              <DataTable.Cell numeric>-</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </Card.Content>
      {!!load?.dispatchAt && load?.dispatchAt > new Date().getTime() / 1000 && (
        <View style={{ flex: 1, backgroundColor: 'black', padding: 8 }}>
          <Paragraph style={{ color: '#FFFFFF' }}>
            {`Take-off in ${differenceInMinutes(
              new Date(),
              (load?.dispatchAt as number) * 1000
            )} min`}
          </Paragraph>
        </View>
      )}

      {!controlsVisible ? null : (
        <Card.Actions>
          {load?.maxSlots && load?.maxSlots < 5 ? null : (
            <Button
              onPress={() => setExpanded(!isExpanded)}
              testID={isExpanded ? 'show-less' : 'show-more'}
            >
              {isExpanded ? 'Show less' : 'Show more'}
            </Button>
          )}
          <View style={{ flexGrow: 1 }} />
          {/* eslint-disable-next-line no-nested-ternary */}
          {!canUpdateLoad || !!load?.hasLanded ? null : load?.dispatchAt ? (
            <Button mode="outlined" onPress={() => updateCall(null)} testID="dispatch-cancel">
              Cancel
            </Button>
          ) : (
            <Menu
              setOpen={setDispatchOpen}
              open={isDispatchOpen}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setDispatchOpen(true)}
                  testID="dispatch-button"
                >
                  Dispatch
                </Button>
              }
            >
              <MenuItem
                testID="dispatch-call"
                onPress={() => {
                  setDispatchOpen(false);
                  updateCall(20);
                }}
                title="20 minute call"
              />
              <MenuItem
                testID="dispatch-call"
                onPress={() => {
                  setDispatchOpen(false);
                  updateCall(15);
                }}
                title="15 minute call"
              />
              <MenuItem
                testID="dispatch-call"
                onPress={() => {
                  setDispatchOpen(false);
                  updateCall(10);
                }}
                title="10 minute call"
              />
              <MenuItem
                onPress={() => {
                  setDispatchOpen(false);
                  updateCall(5);
                }}
                title="5 minute call"
              />
            </Menu>
          )}

          {/* eslint-disable-next-line no-nested-ternary */}
          {load?.hasLanded ? null : load?.dispatchAt &&
            load.dispatchAt < new Date().getTime() / 1000 &&
            canUpdateLoad ? (
            <Button
              style={{ marginLeft: 8 }}
              mode="contained"
              onPress={() => {
                if (!load?.loadMaster?.id) {
                  return dispatch(
                    actions.notifications.showSnackbar({
                      message: 'You must select a load master before this load can be finalized',
                      variant: 'info',
                    })
                  );
                }

                if (!load?.pilot?.id) {
                  return dispatch(
                    actions.notifications.showSnackbar({
                      message: 'You must select a pilot before this load can be finalized',
                      variant: 'info',
                    })
                  );
                }
                return onLanded();
              }}
            >
              Mark as landed
            </Button>
          ) : (
            <Button
              style={{ marginLeft: 8 }}
              mode="contained"
              testID="manifest-button"
              onPress={() => onManifest()}
              disabled={
                !showManifestButton ||
                Boolean(load?.dispatchAt && load.dispatchAt < new Date().getTime() / 1000)
              }
            >
              Manifest
            </Button>
          )}
        </Card.Actions>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  slotText: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
