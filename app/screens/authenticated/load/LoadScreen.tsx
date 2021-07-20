import { gql, useMutation, useQuery } from '@apollo/client';
import * as React from 'react';
import { Dimensions, RefreshControl, StyleSheet } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { Button, Card, DataTable, IconButton, Menu, Paragraph, ProgressBar, Text } from 'react-native-paper';
import addMinutes from "date-fns/addMinutes";
import differenceInMinutes from "date-fns/differenceInMinutes";

import useCurrentDropzone from '../../../graphql/hooks/useCurrentDropzone';
import GCAChip from '../../../components/chips/GcaChip';
import LoadMasterChip from '../../../components/chips/LoadMasterChip';
import PilotChip from '../../../components/chips/PilotChip';
import PlaneChip from '../../../components/chips/PlaneChip';

import { View } from '../../../components/Themed';
import { Query, Load, Mutation, User, Permission, Plane, Slot, DropzoneUser, LoadState } from '../../../graphql/schema.d';
import useRestriction from '../../../hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from '../../../redux';
import SlotCard from "./SlotCard";
import ActionButton from './ActionButton';
import Header from './Header';
import InfoGrid from './InfoGrid';
import { useNavigation, useRoute } from '@react-navigation/core';

interface ILoadScreenProps {
  load: Load;
  onManifestGroup(): void;
  onSlotGroupPress(slots: Slot[]): void;
  onSlotPress(slot: Slot): void;
  onSlotLongPress?(slot: Slot): void;
  onManifest(): void;
}

function AvailableSlotCard() {

  return (
    <Card
      style={{
        maxHeight: 150,
        flexGrow:1,
        borderWidth: 1,
        borderStyle: "dashed",
        opacity: 0.5,
        margin: 4,
        alignItems: "center",
        justifyContent: "center"
    }}>
      <Card.Title title="Available" style={{ alignSelf: "center", justifyContent: "center" }} titleStyle={{ textAlign: "center" }} />
    </Card>
  )
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
      state
      weight
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
        wingLoading
        groupNumber
        
        dropzoneUser {
          id
          role {
            id
            name
          }
          user {
            id
            name
            exitWeight
            license {
              id
              name
            }
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


export default function LoadScreen(props: ILoadScreenProps) {
  const state = useAppSelector(state => state.global);
  const dispatch = useAppDispatch();
  const [isExpanded, setExpanded] = React.useState(false);
  const route = useRoute<{ key: string, name: string, params: { load: Load }}>();

  const { data, loading, refetch } = useQuery<Query>(QUERY_LOAD, {
    variables: {
      id: Number(route.params.load.id),
    },
    // pollInterval: 30000,
  });

  const load = data?.load || route.params.load;
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

  const navigation = useNavigation();

  const slots: Array<Slot | null> = Array.from({ length: (load?.maxSlots || 0) }).map((_, index) => (load?.slots?.length || 0) > index ? (load.slots as Slot[])[index] : null);

  const maxSlots = (load?.maxSlots || load?.plane?.maxSlots || 0);
  const occupiedSlots = (load?.slots?.length || 0);
  const availableSlots = maxSlots - occupiedSlots;

  return (
    <View style={{ flexGrow: 1 }}>
      <Header load={load}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
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
            small
            backgroundColor="transparent"
            color="white"
          />
          <GCAChip
            dropzoneId={Number(currentDropzone?.dropzone?.id)}
            value={data?.load?.gca}
            onSelect={updateGCA}
            small
            backgroundColor="transparent"
            color="white"
          />
          <PilotChip
            dropzoneId={Number(currentDropzone?.dropzone?.id)}
            value={data?.load?.pilot}
            onSelect={updatePilot}
            small
            backgroundColor="transparent"
            color="white"
          />
          <LoadMasterChip
            value={data?.load?.loadMaster}
            slots={data?.load.slots || []}
            onSelect={updateLoadMaster}
            small
            backgroundColor="transparent"
            color="white"
          />
        </ScrollView>
        <InfoGrid
          items={[
            {
              title: "Status",
              value: {
                [LoadState.Open]: "Open",
                [LoadState.BoardingCall]: "On call",
                [LoadState.Cancelled]: "Cancelled",
                [LoadState.InFlight]: "In air",
                [LoadState.Landed]: "Landed"
              }[load?.state]
            },
            { title: "Slots", value: `${occupiedSlots}/${maxSlots}` },
            {
              title: "Weight",
              value: `${load?.weight || 0}kg`
            },
          ]}
        />

      </Header>
      <FlatList
        testID="slots"
        keyExtractor={(item, idx) => `slot-${item?.id || idx}`}
        style={{ flex: 1, height: Dimensions.get('window').height }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100, margin: 8 }}
        numColumns={1}
        horizontal={false}
        data={slots}
        refreshing={loading}
        onRefresh={refetch}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => refetch()} />
        }
        renderItem={({ item: node, index }) =>
          node === null
            ? <AvailableSlotCard key={`empty-slot-${index}`} />
            : (
                <SlotCard
                  key={`slot-${node.id}`}
                  slot={node}
                  onDelete={
                    (currentUser?.id === node.dropzoneUser.id && canRemoveSelf) ||
                    canRemoveOthers ? onDeleteSlot : undefined
                  }
                  onPress={(slot) => {
                    const slotGroup = load?.slots?.filter(({ groupNumber }) => groupNumber && groupNumber === slot.groupNumber);
                    const onSlotGroupPress = () => {
                      dispatch(actions.forms.manifestGroup.reset());
                      dispatch(actions.forms.manifestGroup.setFromSlots(slotGroup!));
                      dispatch(actions.forms.manifestGroup.setField(["load", load]));
                      navigation.navigate("ManifestGroupScreen");
                    };
                    const onSlotPress = () => {
                      dispatch(actions.forms.manifest.setOpen(slot));
                      dispatch(
                        actions.forms.manifest.setField(["load", load])
                      );
                    };

                    if (slot.user?.id === currentUser?.id) {
                      if (canEditSelf) {
                        if (slotGroup?.length) {
                          onSlotGroupPress()
                        } else {
                          onSlotPress();
                        }
                      }
                    } else if (canEditOthers) {
                      if (slotGroup?.length) {
                        onSlotGroupPress()
                      } else {
                        onSlotPress();
                      }
                    }
                    
                  }}
                />
        )}
    />
    <ActionButton load={load} />
  </View>                    
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
