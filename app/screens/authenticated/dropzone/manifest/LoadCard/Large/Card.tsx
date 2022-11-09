import * as React from 'react';
import { ScrollView } from 'react-native';
import { Button, Card, IconButton, Paragraph, ProgressBar, Text } from 'react-native-paper';
import differenceInMinutes from 'date-fns/differenceInMinutes';

import { SlotDetailsFragment, SlotEssentialsFragment } from 'app/api/operations';
import { useDropzoneContext } from 'app/api/crud/useDropzone';
import GCAChip from 'app/components/chips/GcaChip';
import LoadMasterChip from 'app/components/chips/LoadMasterChip';
import PilotChip from 'app/components/chips/PilotChip';
import PlaneChip from 'app/components/chips/PlaneChip';
import Menu, { MenuItem } from 'app/components/popover/Menu';

import { View } from 'app/components/Themed';
import { Permission } from 'app/api/schema.d';
import useRestriction from 'app/hooks/useRestriction';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { useAuthenticatedNavigation } from 'app/screens/authenticated/useAuthenticatedNavigation';
import LoadSlotTable from 'app/components/slots_table/Table';
import { SlotFields } from 'app/components/slots_table/UserRow';
import { useLoadContext } from 'app/api/crud';
import { withLoad } from 'app/api/crud/useLoad';
import { useManifestContext } from 'app/api/crud/useManifest';
import LoadingCard from './Loading';

interface ILoadCardLarge {
  controlsVisible: boolean;
  onManifestGroup(): void;
  onSlotGroupPress(slots: SlotEssentialsFragment[]): void;
  onSlotPress(slot: SlotEssentialsFragment): void;
  onManifest(): void;
}

function LoadCard(props: ILoadCardLarge) {
  const { onManifest, onManifestGroup, controlsVisible, onSlotGroupPress, onSlotPress } = props;
  const state = useAppSelector((root) => root.global);
  const dispatch = useAppDispatch();
  const [isExpanded, setExpanded] = React.useState(false);
  const [isDispatchOpen, setDispatchOpen] = React.useState(false);
  const { deleteSlot } = useManifestContext();
  const [deletingSlot, setDeletingSlot] = React.useState(false);

  const {
    load,
    loading,
    refetch,
    update,
    updateGCA,
    updatePlane,
    updatePilot,
    dispatchInMinutes,
    updateLoadMaster,
    markAsLanded,
  } = useLoadContext();
  const currentDropzone = useDropzoneContext();
  const { currentUser } = currentDropzone;

  const onDeleteSlot = React.useCallback(
    async (slot: SlotDetailsFragment) => {
      try {
        setDeletingSlot(true);

        const response = await deleteSlot({
          id: Number(slot.id),
        });

        if ('error' in response && response.error) {
          dispatch(
            actions.notifications.showSnackbar({
              message:
                response?.error ||
                `${slot.dropzoneUser?.user?.name} could not be taken off load #${load?.loadNumber}`,
              variant: 'error',
            })
          );
        } else if ('slot' in response && slot?.id) {
          dispatch(
            actions.notifications.showSnackbar({
              message: `${
                response.slot?.dropzoneUser?.user?.name || 'User'
              } has been taken off load #${load?.loadNumber}`,
              variant: 'success',
            })
          );
        }
      } finally {
        setDeletingSlot(false);
      }
    },
    [deleteSlot, dispatch, load?.loadNumber]
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
        visible={loading || update.loading || deletingSlot}
        color={state.theme.colors.primary}
      />
      <Card.Content
        style={{
          marginVertical: 8,
          paddingHorizontal: 0,
          height: isExpanded || !controlsVisible ? undefined : 300,
          overflow: 'hidden',
        }}
      >
        <View
          style={{ flexDirection: 'row', paddingHorizontal: 8, backgroundColor: 'transparent' }}
        >
          <ScrollView
            style={{ height: 32 }}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ backgroundColor: 'transparent' }}
          >
            <PlaneChip
              small
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
            <GCAChip small value={load?.gca} onSelect={updateGCA} />
            <PilotChip small value={load?.pilot} onSelect={updatePilot} />
            <LoadMasterChip
              small
              value={load?.loadMaster}
              slots={load?.slots || []}
              onSelect={updateLoadMaster}
            />
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
          fields={[SlotFields.JumpType].filter(Boolean) as SlotFields[]}
        />
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
            <Button
              mode="outlined"
              onPress={() => dispatchInMinutes(null)}
              testID="dispatch-cancel"
            >
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
                  dispatchInMinutes(20);
                }}
                title="20 minute call"
              />
              <MenuItem
                testID="dispatch-call"
                onPress={() => {
                  setDispatchOpen(false);
                  dispatchInMinutes(15);
                }}
                title="15 minute call"
              />
              <MenuItem
                testID="dispatch-call"
                onPress={() => {
                  setDispatchOpen(false);
                  dispatchInMinutes(10);
                }}
                title="10 minute call"
              />
              <MenuItem
                onPress={() => {
                  setDispatchOpen(false);
                  dispatchInMinutes(5);
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
                return markAsLanded();
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

export default withLoad(LoadCard);
