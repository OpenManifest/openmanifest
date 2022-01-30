import * as React from 'react';
import { Dimensions, RefreshControl, useWindowDimensions } from 'react-native';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import { Card } from 'react-native-paper';

import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import SkeletonContent from 'app/components/Skeleton';
import { PlaneEssentialsFragment, SlotDetailsFragment } from 'app/api/operations';
import { useLoadQuery } from 'app/api/reflection';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import GCAChip from 'app/components/chips/GcaChip';
import LoadMasterChip from 'app/components/chips/LoadMasterChip';
import PilotChip from 'app/components/chips/PilotChip';
import PlaneChip from 'app/components/chips/PlaneChip';
import ManifestUserSheet from 'app/components/dialogs/ManifestUser/ManifestUser';
import ManifestGroupSheet from 'app/components/dialogs/ManifestGroup/ManifestGroup';

import { View } from 'app/components/Themed';
import { Load, Permission, Slot, DropzoneUser, LoadState } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import SlotCard from './SlotCard';
import ActionButton from './ActionButton';
import Header from './Header';
import InfoGrid from './InfoGrid';
import useMutationDeleteSlot from 'app/api/hooks/useMutationDeleteSlot';
import useMutationUpdateLoad from 'app/api/hooks/useMutationUpdateLoad';

function AvailableSlotCard({ width }: { width: number }) {
  return (
    <Card
      style={{
        height: 150,
        opacity: 0.5,
        margin: 12,
        width,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      elevation={3}
    >
      <Card.Title
        title="Available"
        style={{ alignSelf: 'center', justifyContent: 'center', flex: 1 }}
        titleStyle={{ textAlign: 'center' }}
      />
    </Card>
  );
}

function SlotSkeleton({ width }: { width: number }) {
  return (
    <SkeletonContent
      isLoading
      containerStyle={{
        height: 150,
        width,
        margin: 12,
      }}
      layout={[{ key: 'user-card-container', height: 150, width }]}
    />
  );
}

const loadingFragment: SlotDetailsFragment = {
  id: '__LOADING__',
  cost: 0,
  createdAt: 0,
  exitWeight: 0,
  groupNumber: 0,
  extras: null,
  jumpType: null,
  passengerExitWeight: null,
  __typename: 'Slot',
  passengerName: null,
  ticketType: null,
  wingLoading: null
};

export type LoadScreenRoute = {
  LoadScreen: {
    loadId: string;
  }
};

export default function LoadScreen() {
  const dispatch = useAppDispatch();
  const [isExpanded, setExpanded] = React.useState(false);
  const forms = useAppSelector((root) => root.forms);
  const { palette, theme } = useAppSelector((root) => root.global);
  const route = useRoute<RouteProp<LoadScreenRoute>>();
  const loadId = route?.params?.loadId;

  const { data, loading, refetch } = useLoadQuery({
    variables: {
      id: Number(route.params.loadId),
    },
    pollInterval: 30000,
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
    async (slot: Slot) => {
      await mutationDeleteSlot.mutate({
        id: Number(slot.id),
      });
    },
    [mutationDeleteSlot]
  );

  const updatePilot = React.useCallback(
    async (pilot: DropzoneUser) => {
      await mutationUpdateLoad.mutate({
        id: Number(loadId),
        pilotId: Number(pilot.id),
      });
    },
    [mutationUpdateLoad, loadId]
  );

  const updateGCA = React.useCallback(
    async (gca: DropzoneUser) => {
      await mutationUpdateLoad.mutate({
        id: Number(loadId),
        gcaId: Number(gca.id),
      });
    },
    [mutationUpdateLoad, loadId]
  );

  const updatePlane = React.useCallback(
    async (plane: PlaneEssentialsFragment) => {
      await mutationUpdateLoad.mutate({
        id: Number(loadId),
        planeId: Number(plane.id),
      });
    },
    [mutationUpdateLoad, loadId]
  );

  const updateLoadMaster = React.useCallback(
    async (lm: DropzoneUser) => {
      await mutationUpdateLoad.mutate({
        id: Number(loadId),
        loadMasterId: Number(lm.id),
      });
    },
    [mutationUpdateLoad, loadId]
  );

  const canEditSelf = useRestriction(Permission.UpdateSlot);
  const canEditOthers = useRestriction(Permission.UpdateUserSlot);

  const canRemoveSelf = useRestriction(Permission.DeleteSlot);
  const canRemoveOthers = useRestriction(Permission.DeleteUserSlot);
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (load?.maxSlots && load?.maxSlots < 5 && !isExpanded) {
      setExpanded(true);
    }
  }, [isExpanded, load?.maxSlots]);


  const slots: SlotDetailsFragment[] = Array.from({
    length: (load?.slots?.length || 0) + (load?.availableSlots || 0),
  }).map((_, index) =>
    ((load?.slots?.length || 0) > index ? (load?.slots as SlotDetailsFragment[])[index] : { ...loadingFragment, id: '__AVAILABLE__' } ));

  const maxSlots = load?.maxSlots || load?.plane?.maxSlots || 0;
  const occupiedSlots = maxSlots - (load?.availableSlots || 0);

  const { width } = useWindowDimensions();

  const cardWidth = 364;
  const padding = 24;
  const numColumns = Math.floor(width / (cardWidth + padding)) || 1;
  let contentWidth = (cardWidth + padding) * numColumns + padding;
  contentWidth = width < contentWidth ? width : contentWidth;

  const initialLoading = !load?.slots?.length && loading;

  return (
    <View style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
      <Header
        load={load}
        renderBadges={() => (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 8 }}
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
              small
              backgroundColor="transparent"
              color={palette.onSurface}
            />
            <GCAChip
              value={load?.gca}
              onSelect={updateGCA}
              small
              backgroundColor="transparent"
              color={palette.onSurface}
            />
            <PilotChip
              value={load?.pilot}
              onSelect={updatePilot}
              small
              backgroundColor="transparent"
              color={palette.onSurface}
            />
            <LoadMasterChip
              value={load?.loadMaster}
              slots={load?.slots || []}
              onSelect={updateLoadMaster}
              small
              backgroundColor="transparent"
              color={palette.onSurface}
            />
          </ScrollView>
        )}
      >
        <InfoGrid
          items={[
            {
              title: 'Status',
              value: {
                [LoadState.Open]: 'Open',
                [LoadState.BoardingCall]: 'On call',
                [LoadState.Cancelled]: 'Cancelled',
                [LoadState.InFlight]: 'In air',
                [LoadState.Landed]: 'Landed',
              }[load?.state || LoadState.Open],
            },
            { title: 'Slots', value: `${occupiedSlots}/${maxSlots}` },
            {
              title: 'Weight',
              value: `${load?.weight || 0}kg`,
            },
          ]}
        />
      </Header>
      <FlatList<SlotDetailsFragment>
        testID="slots"
        keyExtractor={(_, idx) => `slot-${idx}`}
        style={{ flex: 1, height: Dimensions.get('window').height }}
        contentContainerStyle={{
          width: contentWidth,
          alignSelf: 'center',
          justifyContent: 'space-evenly',
          paddingBottom: 100,
        }}
        numColumns={numColumns}
        horizontal={false}
        data={!initialLoading ? slots : new Array(8).fill(loadingFragment)}
        refreshing={loading}
        onRefresh={refetch}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
        renderItem={({ item: node, index }) => {
          if (node.id === '__LOADING__') {
            return <SlotSkeleton width={cardWidth} />;
          }

          return node.id === '__AVAILABLE__' ? (
            <AvailableSlotCard key={`empty-slot-${index}`} width={cardWidth} />
          ) : (
            <SlotCard
              style={{ width: cardWidth }}
              key={`slot-${node.id}`}
              slot={node}
              onDelete={
                (currentUser?.id === node?.dropzoneUser?.id && canRemoveSelf) || canRemoveOthers
                  ? onDeleteSlot
                  : undefined
              }
              onPress={(slot) => {
                const slotGroup = load?.slots?.filter(
                  ({ groupNumber }) => groupNumber && groupNumber === slot.groupNumber
                );
                const onSlotGroupPress = () => {
                  if (slotGroup && load) {
                    dispatch(actions.forms.manifestGroup.reset());
                    dispatch(actions.forms.manifestGroup.setFromSlots({ slots: slotGroup, load }));
                    dispatch(actions.forms.manifestGroup.setField(['load', load]));
                    // FIXME: Open ManifestGroup Drawer
                  }
                };
                const onSlotPress = () => {
                  dispatch(actions.forms.manifest.setOpen(slot));
                  dispatch(actions.forms.manifest.setField(['load', load]));
                };

                if (slot.dropzoneUser?.id === currentUser?.id) {
                  if (canEditSelf) {
                    if (slotGroup?.length) {
                      onSlotGroupPress();
                    } else {
                      onSlotPress();
                    }
                  }
                } else if (canEditOthers) {
                  if (slotGroup?.length) {
                    onSlotGroupPress();
                  } else {
                    onSlotPress();
                  }
                }
              }}
            />
          );
        }}
      />
      {load && isFocused ? <ActionButton load={load} /> : null}
      <ManifestUserSheet
        open={forms.manifest.open}
        onClose={() => dispatch(actions.forms.manifest.setOpen(false))}
        onSuccess={() => {
          dispatch(actions.forms.manifest.setOpen(false));
        }}
      />
      <ManifestGroupSheet
        open={forms.manifestGroup.open}
        onClose={() => {
          dispatch(actions.forms.manifestGroup.setOpen(false));
          dispatch(actions.forms.manifestGroup.reset());
        }}
        onSuccess={() => dispatch(actions.forms.manifestGroup.setOpen(false))}
      />
    </View>
  );
}
