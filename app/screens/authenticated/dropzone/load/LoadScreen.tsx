import * as React from 'react';
import { FlatList, Platform } from 'react-native';

import { RouteProp, useIsFocused, useRoute } from '@react-navigation/core';
import {
  PlaneEssentialsFragment,
  SlotDetailsFragment,
  SlotEssentialsFragment,
} from 'app/api/operations';
import { useLoadQuery } from 'app/api/reflection';
import GCAChip from 'app/components/chips/GcaChip';
import LoadMasterChip from 'app/components/chips/LoadMasterChip';
import PilotChip from 'app/components/chips/PilotChip';
import PlaneChip from 'app/components/chips/PlaneChip';
import ManifestUserSheet from 'app/components/dialogs/ManifestUser/ManifestUser';
import ManifestGroupSheet from 'app/components/dialogs/ManifestGroup/ManifestGroup';

import { View } from 'app/components/Themed';
import { DropzoneUser, LoadState, Permission } from 'app/api/schema.d';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import useMutationUpdateLoad from 'app/api/hooks/useMutationUpdateLoad';

import useRestriction from 'app/hooks/useRestriction';
import useCurrentDropzone from 'app/api/hooks/useCurrentDropzone';
import useMutationDeleteSlot from 'app/api/hooks/useMutationDeleteSlot';
import { Divider } from 'react-native-paper';
import ActionButton from './ActionButton';
import Header from './Header';
import InfoGrid from './InfoGrid';
// import CardView from './views/CardView';
import TableView from './views/TableView';

export type LoadScreenRoute = {
  LoadScreen: {
    loadId: string;
  };
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

  const updatePilot = React.useCallback(
    async (pilot: DropzoneUser) => {
      await mutationUpdateLoad.mutate({
        id: Number(loadId),
        pilot: Number(pilot.id),
      });
    },
    [mutationUpdateLoad, loadId]
  );

  const updateGCA = React.useCallback(
    async (gca: DropzoneUser) => {
      await mutationUpdateLoad.mutate({
        id: Number(loadId),
        gca: Number(gca.id),
      });
    },
    [mutationUpdateLoad, loadId]
  );

  const updatePlane = React.useCallback(
    async (plane: PlaneEssentialsFragment) => {
      await mutationUpdateLoad.mutate({
        id: Number(loadId),
        plane: Number(plane.id),
      });
    },
    [mutationUpdateLoad, loadId]
  );

  const updateLoadMaster = React.useCallback(
    async (lm: DropzoneUser) => {
      await mutationUpdateLoad.mutate({
        id: Number(loadId),
        loadMaster: Number(lm.id),
      });
    },
    [mutationUpdateLoad, loadId]
  );

  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (load?.maxSlots && load?.maxSlots < 5 && !isExpanded) {
      setExpanded(true);
    }
  }, [isExpanded, load?.maxSlots]);

  const currentDropzone = useCurrentDropzone();
  const { currentUser } = currentDropzone;

  const canManifestGroup = useRestriction(Permission.CreateUserSlot);
  const canManifestGroupWithSelfOnly = useRestriction(Permission.CreateUserSlotWithSelf);
  const canEditSelf = useRestriction(Permission.UpdateSlot);
  const canEditOthers = useRestriction(Permission.UpdateUserSlot);
  const maxSlots = load?.maxSlots || 0;
  const occupiedSlots = load?.occupiedSlots || 0;

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
    async (slot: SlotEssentialsFragment) => {
      await mutationDeleteSlot.mutate({
        id: Number(slot.id),
      });
    },
    [mutationDeleteSlot]
  );

  const onSlotPress = React.useCallback(
    (slot: SlotDetailsFragment) => {
      const slotGroup = load?.slots?.filter(
        ({ groupNumber }) => groupNumber && groupNumber === slot.groupNumber
      );
      const onSlotGroupPress = () => {
        if (slotGroup && load) {
          dispatch(actions.forms.manifestGroup.reset());
          dispatch(actions.forms.manifestGroup.setOpen(true));
          dispatch(
            actions.forms.manifestGroup.setFromSlots({
              slots: slotGroup?.length ? slotGroup : [slot],
              load,
            })
          );
          dispatch(actions.forms.manifestGroup.setField(['load', load]));

          // FIXME: Open ManifestGroup Drawer
        }
      };
      const onSlotSinglePress = () => {
        dispatch(actions.forms.manifest.setOpen(slot));
        dispatch(actions.forms.manifest.setField(['load', load]));
      };

      if ((canEditSelf && slot.dropzoneUser?.id === currentUser?.id) || canEditOthers) {
        if (canEditSelf) {
          if (slotGroup?.length || Platform.OS === 'web') {
            onSlotGroupPress();
          } else {
            onSlotSinglePress();
          }
        }
      }
    },
    [canEditOthers, canEditSelf, currentUser?.id, dispatch, load]
  );

  const onSlotGroupPress = React.useCallback(
    (slotGroup: SlotDetailsFragment[]) => {
      if (load) {
        dispatch(actions.forms.manifestGroup.reset());
        dispatch(actions.forms.manifestGroup.setFromSlots({ slots: slotGroup, load }));
        dispatch(actions.forms.manifestGroup.setField(['load', load]));
      }
    },
    [dispatch, load]
  );

  const onAvailableSlotPress = React.useCallback(() => {
    dispatch(actions.forms.manifestGroup.reset());
    dispatch(actions.forms.manifestGroup.setField(['load', load]));

    if (canManifestGroupWithSelfOnly && !canManifestGroup && currentUser) {
      // Automatically add current user to selection
      dispatch(actions.screens.manifest.setSelected([currentUser]));
      dispatch(actions.forms.manifestGroup.setDropzoneUsers([currentUser]));
    }

    dispatch(actions.forms.manifestGroup.setOpen(true));
    dispatch(actions.forms.manifestGroup.setField(['load', load]));
  }, [canManifestGroup, canManifestGroupWithSelfOnly, currentUser, dispatch, load]);

  return (
    <View style={{ flexGrow: 1, backgroundColor: theme.colors.background }}>
      <Header
        load={load || undefined}
        renderBadges={() => (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginVertical: 8 }}
            data={['plane', 'pilot', 'gca', 'loadMaster']}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => {
              switch (item) {
                case 'plane':
                  return (
                    <PlaneChip
                      value={load?.plane}
                      onSelect={async (plane) => {
                        if ((load?.slots?.length || 0) > (plane.maxSlots || 0)) {
                          const diff = (load?.slots?.length || 0) - (plane.maxSlots || 0);

                          dispatch(
                            actions.notifications.showSnackbar({
                              // eslint-disable-next-line max-len
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
                  );
                case 'gca':
                  return (
                    <GCAChip
                      value={load?.gca}
                      onSelect={updateGCA}
                      small
                      backgroundColor="transparent"
                      color={palette.onSurface}
                    />
                  );
                case 'pilot':
                  return (
                    <PilotChip
                      value={load?.pilot}
                      onSelect={updatePilot}
                      small
                      backgroundColor="transparent"
                      color={palette.onSurface}
                    />
                  );
                default:
                  return (
                    <LoadMasterChip
                      value={load?.loadMaster}
                      slots={load?.slots || []}
                      onSelect={updateLoadMaster}
                      small
                      backgroundColor="transparent"
                      color={palette.onSurface}
                    />
                  );
              }
            }}
          />
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
      {/* <CardView {...{ load, loading, refetch, onSlotPress, onDeletePress: onDeleteSlot }} /> */}
      <Divider />
      <TableView
        {...{
          slots: load?.slots?.filter(Boolean) || [],
          load,
          loading,
          refetch,
          onSlotPress,
          onDeletePress: onDeleteSlot,
          onSlotGroupPress,
          onAvailableSlotPress,
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
