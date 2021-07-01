import { gql, useMutation, useQuery } from '@apollo/client';
import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, DataTable, IconButton, Menu, Paragraph, ProgressBar, Text } from 'react-native-paper';
import addMinutes from "date-fns/addMinutes";
import differenceInMinutes from "date-fns/differenceInMinutes";

import useCurrentDropzone from '../../../graphql/hooks/useCurrentDropzone';
import GCAChip from '../../../components/chips/GcaChip';
import LoadMasterChip from '../../../components/chips/LoadMasterChip';
import PilotChip from '../../../components/chips/PilotChip';
import PlaneChip from '../../../components/chips/PlaneChip';

import { View } from '../../../components/Themed';
import { Query, Load, Mutation, User, Permission, Plane, Slot, DropzoneUser } from '../../../graphql/schema.d';
import useRestriction from '../../../hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from '../../../redux';
import SwipeActions from '../../../components/layout/SwipeActions';

interface ILoadCard {
  load: Load;
  onManifestGroup(): void;
  onSlotGroupPress(slots: Slot[]): void;
  onSlotPress(slot: Slot): void;
  onSlotLongPress?(slot: Slot): void;
  onManifest(): void;
}


export const QUERY_LOAD = gql`
  query QueryLoad($id: Int!) {
    load(id: $id) {
      id
      name
      createdAt
      dispatchAt
      hasLanded
      maxSlots
      loadNumber
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
        exitWeight
        passengerName
        passengerExitWeight
        
        dropzoneUser {
          id
          user {
            id
            name
          }
        }
        ticketType {
          id
          name
          altitude
          isTandem

          extras {
            id
            name
            cost
          }
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
`;

const MUTATION_UPDATE_LOAD = gql`
  mutation UpdateLoad(
    $id: Int!,
    $pilotId: Int,
    $gcaId: Int,
    $planeId: Int,
    $isOpen: Boolean,
    $loadMasterId: Int,
    $dispatchAt: Int,
    $hasLanded: Boolean,
  ){
    updateLoad(input: {
      id: $id
      attributes: {
        pilotId: $pilotId,
        gcaId: $gcaId,
        planeId: $planeId,
        isOpen: $isOpen,
        loadMasterId: $loadMasterId
        dispatchAt: $dispatchAt
        hasLanded: $hasLanded
      }
    }) {
      load {
        id
        name
        createdAt
        loadNumber
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
          exitWeight

          passengerName
          passengerExitWeight

          user {
            id
            name
          }
          ticketType {
            id
            name
            altitude
            isTandem
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


const MUTATION_DELETE_SLOT = gql`
mutation DeleteSlot($id: Int!) {
  deleteSlot(input: { id: $id }) {
    slot {
      id
      load {
        id
        slots {
          id
          createdAt
          exitWeight

          passengerName
          passengerExitWeight

          user {
            id
            name
          }
          ticketType {
            id
            name
            altitude
            isTandem
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
}
`;


export default function LoadCard(props: ILoadCard) {
  const state = useAppSelector(state => state.global);
  const dispatch = useAppDispatch();
  const [isExpanded, setExpanded] = React.useState(false);
  const [isDispatchOpen, setDispatchOpen] = React.useState(false);

  const { load, onManifest, onManifestGroup } = props;
  const { data, loading, refetch } = useQuery<Query>(QUERY_LOAD, {
    variables: {
      id: Number(load.id),
    },
    // pollInterval: 30000,
  });
  const currentDropzone = useCurrentDropzone();
  const { currentUser } = currentDropzone;

  const [mutationUpdateLoad, mutation] = useMutation<Mutation>(MUTATION_UPDATE_LOAD);
  const [mutationDeleteSlot, mutationDelete] = useMutation<Mutation>(MUTATION_DELETE_SLOT);

  const onDeleteSlot = React.useCallback(async (slot: Slot) => {
    try {
      const result = await mutationDeleteSlot({
        variables: {
          id: Number(slot.id)
        }
      });

      if (result?.data?.deleteSlot?.errors) {
        dispatch(
          actions.notifications.showSnackbar({
            message: result.data.deleteSlot.errors[0],
            variant: "error"
          })
        );
      }
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const updatePilot = React.useCallback(async (pilot: DropzoneUser) => {
    try {
      await mutationUpdateLoad({ variables: { id: Number(load.id), pilotId: Number(pilot.id) }});
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const updateGCA = React.useCallback(async (gca: DropzoneUser) => {
    try {
      await mutationUpdateLoad({ variables: { id: Number(load.id), gcaId: Number(gca.id) }});
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const updatePlane = React.useCallback(async (plane: Plane) => {
    try {
      await mutationUpdateLoad({ variables: { id: Number(load.id), planeId: Number(plane.id) }});
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const updateLoadMaster = React.useCallback(async (lm: DropzoneUser) => {
    try {
      await mutationUpdateLoad({ variables: { id: Number(load.id), loadMasterId: Number(lm.id) }});
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const updateCall = React.useCallback(async (minutes: number | null) => {
    const dispatchTime = !minutes ? null : addMinutes(new Date(), minutes).getTime() / 1000;

    try {
      await mutationUpdateLoad({
        variables: {
          id: Number(load.id),
          dispatchAt: dispatchTime ? Math.ceil(dispatchTime) : null
        }
      });
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const onLanded = React.useCallback(async () => {
    try {
      await mutationUpdateLoad({
        variables: {
          id: Number(load.id),
          hasLanded: true,
        }
      });
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  
  const canUpdateLoad = useRestriction(Permission.UpdateLoad);
  
  const canEditSelf = useRestriction(Permission.UpdateSlot);
  const canEditOthers = useRestriction(Permission.UpdateUserSlot);
  
  const canRemoveSelf = useRestriction(Permission.DeleteSlot);
  const canRemoveOthers = useRestriction(Permission.DeleteUserSlot);
  
  const canManifestSelf = useRestriction(Permission.CreateSlot);
  const canManifestGroup = useRestriction(Permission.CreateUserSlot);
  const canManifestGroupWithSelfOnly = useRestriction(Permission.CreateUserSlotWithSelf);

  const showManifestButton = canManifestSelf && data?.load?.isOpen && !data?.load?.isFull;

  React.useEffect(() => {
    if (data?.load?.maxSlots && data?.load?.maxSlots < 5 && !isExpanded) {
      setExpanded(true);
    }
  }, [data?.load?.maxSlots]);

  const showGroupIcon = (canManifestGroup || canManifestGroupWithSelfOnly) && !data?.load?.hasLanded && (!data?.load?.dispatchAt || data?.load.dispatchAt > (new Date().getTime() / 1000));

  return (
  <Card testID="load-card" style={{ margin: 16, opacity: data?.load?.hasLanded ? 0.5 : 1.0 }} elevation={3}>
    <Card.Title
      style={{ justifyContent: "space-between"}}
      title={
        <View style={{ width: "100%", flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text>{`Load ${data?.load?.loadNumber || 0}`}</Text>
          <View style={{ flexGrow: 1 }} />
          { showGroupIcon && (
            <IconButton
              icon="account-group"
              testID="manifest-group-button"
              onPress={() => {
                dispatch(actions.forms.manifestGroup.reset());
                dispatch(actions.forms.manifestGroup.setField(["load", load]));

                if (canManifestGroupWithSelfOnly && !canManifestGroup) {
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
      subtitle={load.name}
    />
    <ProgressBar
      visible={loading || mutation.loading}
      color={state.theme.colors.accent}
    />
    <Card.Content style={{ marginVertical: 8, height: isExpanded ? undefined : 300, overflow: "hidden" }}>
      <View style={{ flexDirection: "row"}}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <PlaneChip
            value={data?.load?.plane}
            onSelect={async (plane) => {
              if ((data?.load?.slots?.length || 0) > (plane.maxSlots || 0)) {
                const diff = (data?.load?.slots?.length || 0) - (plane.maxSlots || 0);

                dispatch(
                  actions.notifications.showSnackbar({
                    message: `You need to take ${diff} people off the load to fit on this plane`,
                    variant: "warning",
                  })
                );
              } else {
                await updatePlane(plane);
                refetch();
              }
            }}
          />
          <GCAChip
            dropzoneId={Number(currentDropzone?.dropzone?.id)}
            value={data?.load?.gca}
            onSelect={updateGCA}
          />
          <PilotChip
            dropzoneId={Number(currentDropzone?.dropzone?.id)}
            value={data?.load?.pilot}
            onSelect={updatePilot}
          />
          <LoadMasterChip
            value={data?.load?.loadMaster}
            slots={data?.load.slots || []}
            onSelect={updateLoadMaster}
          />
        </ScrollView>
      </View>
      <DataTable>
        <DataTable.Header style={{ width: "100%"}}>
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title numeric>Jump type</DataTable.Title>
          <DataTable.Title numeric>Altitude</DataTable.Title>
        </DataTable.Header>
          {
            data?.load?.slots?.map(slot => {
              const slotGroup = data?.load?.slots?.filter(({ groupNumber }) => groupNumber && groupNumber === slot.groupNumber);
              const isCurrentUser = slot?.user?.id === currentUser?.id;

              return (
                <SwipeActions
                  disabled={
                    (isCurrentUser && !canRemoveSelf) || (!isCurrentUser && !canRemoveOthers)
                  }
                  key={`slot-${slot.id}`}
                  rightAction={{
                    label: "Delete",
                    backgroundColor: "red",
                    onPress: () => onDeleteSlot(slot),
                  }}
                >
                  <DataTable.Row
                    testID="slot-row"
                    disabled={!!data?.load?.hasLanded}
                    onPress={() => {
                      if (slot.user?.id === currentUser?.id) {
                        if (canEditSelf) {
                          if (slotGroup?.length) {
                            props.onSlotGroupPress(slotGroup!)
                          } else {
                            props.onSlotPress(slot);
                          }
                        }
                      } else if (canEditOthers) {
                        if (slotGroup?.length) {
                          props.onSlotGroupPress(slotGroup!)
                        } else {
                          props.onSlotPress(slot);
                        }
                      }
                    }}
                    pointerEvents="none"
                  >
                    <DataTable.Cell>
                      <Paragraph style={styles.slotText}>
                        {slot?.dropzoneUser?.user?.name}
                      </Paragraph>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Paragraph style={styles.slotText}>
                        {slot?.jumpType?.name}
                      </Paragraph>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                      <Paragraph style={styles.slotText}>
                        {((slot?.ticketType?.altitude || 14000) / 1000)}k
                      </Paragraph>
                    </DataTable.Cell>
                  </DataTable.Row>
                </SwipeActions>
              )
            })
          }
          {
            Array.from({length: (data?.load?.maxSlots || 0) - (data?.load?.slots?.length || 0)}, (v, i) => i).map((i) =>
              <DataTable.Row key={`${load.id}-empty-slot-${i}`} testID="slot-row">
                <DataTable.Cell><Paragraph style={styles.slotText}>- Available -</Paragraph></DataTable.Cell>
                <DataTable.Cell numeric>-</DataTable.Cell>
                <DataTable.Cell numeric>-</DataTable.Cell>
              </DataTable.Row>
            )
          }
      </DataTable>
    </Card.Content>
    {
      !!data?.load?.dispatchAt && data?.load?.dispatchAt > (new Date().getTime() / 1000) && (
        <View style={{ flex: 1, backgroundColor: "black", padding: 8 }}>
          <Paragraph style={{ color: "#FFFFFF" }}>
            {
              `Take-off in ${differenceInMinutes(new Date(), (data?.load?.dispatchAt as number) * 1000)} min`
            }
          </Paragraph>
        </View>
    )}
    <Card.Actions>
      {
        data?.load?.maxSlots && data?.load?.maxSlots < 5 ? null :
          <Button onPress={() => setExpanded(!isExpanded)} testID={ isExpanded ? "show-less" : "show-more" }>
            { isExpanded ? "Show less" : "Show more" }
          </Button>
      }
      <View style={{ flexGrow: 1 }} />
      {
       !canUpdateLoad || !!data?.load?.hasLanded ? null : (
      
          data?.load?.dispatchAt
            ? (
              <Button mode="outlined" onPress={() => updateCall(null)} testID="dispatch-cancel">
                Cancel
              </Button>
            ) : (
              <Menu
                onDismiss={() => setDispatchOpen(false)}
                visible={isDispatchOpen}
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
                <Menu.Item
                  testID="dispatch-call"
                  onPress={() => {
                    setDispatchOpen(false);
                    updateCall(20)
                  }}
                  title="20 minute call"
                />
                <Menu.Item
                  testID="dispatch-call"
                  onPress={() => {
                    setDispatchOpen(false);
                    updateCall(15)
                  }}
                  title="15 minute call"
                />
                <Menu.Item
                  testID="dispatch-call"
                  onPress={() => {
                    setDispatchOpen(false);
                    updateCall(10)
                  }}
                  title="10 minute call"
                />
                <Menu.Item
                  onPress={() => {
                    setDispatchOpen(false);
                    updateCall(5)
                  }}
                  title="5 minute call"
                />
              </Menu>
            ))}
      
      {
        data?.load?.hasLanded ? null : (
          data?.load?.dispatchAt && data?.load.dispatchAt < new Date().getTime() / 1000 && canUpdateLoad
            ? <Button
                style={{ marginLeft: 8 }}
                mode="contained"
                onPress={() => {
                  if (!data?.load?.loadMaster?.id) {
                    return dispatch(
                      actions.notifications.showSnackbar({
                        message: "You must select a load master before this load can be finalized",
                        variant: "warning"
                      })
                    );
                  }

                  if (!data?.load?.pilot?.id) {
                    return dispatch(
                      actions.notifications.showSnackbar({
                        message: "You must select a pilot before this load can be finalized",
                        variant: "warning"
                      })
                    );
                  }
                  onLanded();
                }}>
                Mark as landed
              </Button>
            : <Button
                style={{marginLeft: 8 }}
                mode="contained"
                testID="manifest-button"
                onPress={() => onManifest()}
                disabled={!showManifestButton || Boolean(data?.load?.dispatchAt && data.load.dispatchAt < new Date().getTime() / 1000)}
              >
                Manifest
              </Button>
        )
      }
    </Card.Actions>
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
    fontSize: 12
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
