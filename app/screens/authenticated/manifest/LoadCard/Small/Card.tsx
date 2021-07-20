import { gql } from '@apollo/client';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Badge, Card, Chip } from 'react-native-paper';
import { isBefore } from 'date-fns';

import useCurrentDropzone from '../../../../../graphql/hooks/useCurrentDropzone';
import PilotChip from '../../../../../components/chips/PilotChip';
import PlaneChip from '../../../../../components/chips/PlaneChip';

import { View } from '../../../../../components/Themed';
import { Load, Plane, DropzoneUser, LoadState, Slot } from '../../../../../graphql/schema.d';
import { actions, useAppDispatch } from '../../../../../redux';
import { errorColor, successColor, warningColor } from '../../../../../constants/Colors';
import Countdown from '../Countdown';
import useQueryLoad from '../../../../../graphql/hooks/useQueryLoad';
import useMutationUpdateLoad from '../../../../../graphql/hooks/useMutationUpdateLoad';
import useMutationDeleteSlot from '../../../../../graphql/hooks/useMutationDeleteSlot';
import Loading from './Loading';

interface ILoadCardSmall {
  load: Load;
  onPress(): void;
}

const LOAD_BADGE_COLOR = {
  open: successColor,
  cancelled: errorColor,
  boarding_call: warningColor,
};

export default function LoadCard(props: ILoadCardSmall) {
  const dispatch = useAppDispatch();

  const { onPress } = props;
  const { data: load, loading, refetch } = useQueryLoad({
    variables: {
      id: Number(props.load.id),
    },
    showSnackbarErrors: true,
    pollInterval: 30000,
  });
  const currentDropzone = useCurrentDropzone();

  const mutationUpdateLoad = useMutationUpdateLoad({
    onSuccess: () => dispatch(
      actions.notifications.showSnackbar({
        message: `Load #${load?.loadNumber} updated`,
        variant: "success"
      })
    ),
    onError: (message) =>
      dispatch(
        actions.notifications.showSnackbar({
          message,
          variant: "error"
        })
      )
  });
  const mutationDeleteSlot = useMutationDeleteSlot({
    onSuccess: (payload) => dispatch(
      actions.notifications.showSnackbar({
        message: `${payload.slot?.dropzoneUser?.user?.name || "User"} has been taken off load #${load.loadNumber}`,
        variant: "success"
      })
    ),
    onError: (message) =>
      dispatch(
        actions.notifications.showSnackbar({
          message,
          variant: "error"
        })
      )
  });

  const onDeleteSlot = React.useCallback(async (slot: Slot) => {
    await mutationDeleteSlot.mutate({
        id: Number(slot.id)
      });
  }, [mutationUpdateLoad, JSON.stringify(load)]);

  const updatePilot = React.useCallback(async (pilot: DropzoneUser) => {
    await mutationUpdateLoad.mutate({ id: Number(load.id), pilotId: Number(pilot.id) });
  }, [mutationUpdateLoad.mutate, JSON.stringify(load)]);


  const updatePlane = React.useCallback(async (plane: Plane) => {
    await mutationUpdateLoad.mutate({ id: Number(load.id), planeId: Number(plane.id) });
  }, [mutationUpdateLoad.mutate, JSON.stringify(load)]);

  if (loading) {
    return <Loading />;
  }
  
  const loadStates = {
    [LoadState.Open]: "Open",
    [LoadState.BoardingCall]: "On call",
    [LoadState.Cancelled]: "Cancelled",
    [LoadState.InFlight]: "In air",
    [LoadState.Landed]: "Landed"
  };
  return (
    <Card
      testID="load-card"
      style={{
        margin: 16,
        borderRadius: 8,
        opacity: ['cancelled', 'landed'].includes(load?.state) ? 0.5 : 1.0
      }}
      elevation={3}
      onPress={onPress}
    >
      <Badge
        style={{
          backgroundColor: LOAD_BADGE_COLOR[load?.state],
          marginTop: -5,
          marginRight: -5,
        }}
      >
        {loadStates[load?.state] || ''}
      </Badge>
      <Card.Title
        style={{ justifyContent: "space-between" }}
        title={`Load #${load.loadNumber}`}
        subtitle={load.name}
        right={() => !load?.dispatchAt || isBefore(new Date(), load?.dispatchAt) ? null : (
          <View style={{ marginRight: 16 }}>
            <Countdown end={new Date(load?.dispatchAt * 1000)} />
          </View>
        )}
      />
      
      <Card.Content style={styles.cardContent}>
        <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>
            <PlaneChip
              value={load?.plane}
              small
              onSelect={async (plane) => {
                if ((load?.slots?.length || 0) > (plane.maxSlots || 0)) {
                  const diff = (load?.slots?.length || 0) - (plane.maxSlots || 0);

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
            <PilotChip
              dropzoneId={Number(currentDropzone?.dropzone?.id)}
              value={load?.pilot}
              onSelect={updatePilot}
              small
            />
            <Chip
              mode="outlined"
              icon="parachute"
              style={styles.smallChip}
              textStyle={styles.smallChipText}
            >
              {load?.slots?.length} / {load?.plane?.maxSlots}
            </Chip>
        </View>
        </Card.Content>
    </Card>           
  );
}

const styles = StyleSheet.create({
  cardContent: {
    marginVertical: 8,
    overflow: "hidden",
    flexDirection: "row"
  },
  smallChip: {
    height: 25,
    margin: 4,
    alignItems: "center"
  },
  smallChipText: { fontSize: 12 },
});
