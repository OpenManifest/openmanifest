import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Badge, Card, Chip, useTheme } from 'react-native-paper';
import { isBefore } from 'date-fns';

import PilotChip from '../../../../../components/chips/PilotChip';
import PlaneChip from '../../../../../components/chips/PlaneChip';

import { View } from '../../../../../components/Themed';
import { Load, Plane, DropzoneUser, LoadState } from '../../../../../api/schema.d';
import { actions, useAppDispatch } from '../../../../../state';
import { errorColor, successColor, warningColor } from '../../../../../constants/Colors';
import Countdown from '../Countdown';
import useQueryLoad from '../../../../../api/hooks/useQueryLoad';
import useMutationUpdateLoad from '../../../../../api/hooks/useMutationUpdateLoad';
import Loading from './Loading';

interface ILoadCardSmall {
  load: Load;
  onPress(): void;
}

const LOAD_BADGE_COLOR: { [K in LoadState]?: string } = {
  open: successColor,
  cancelled: errorColor,
  boarding_call: warningColor,
};

export default function LoadCard(props: ILoadCardSmall) {
  const { load: initialRecord, onPress } = props;
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const {
    data: load,
    loading,
    refetch,
  } = useQueryLoad({
    variables: {
      id: Number(initialRecord.id),
    },
    showSnackbarErrors: true,
    pollInterval: 30000,
  });

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

  const updatePlane = React.useCallback(
    async (plane: Plane) => {
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

  if (loading) {
    return <Loading />;
  }

  const loadStates = {
    [LoadState.Open]: 'Open',
    [LoadState.BoardingCall]: 'On call',
    [LoadState.Cancelled]: 'Cancelled',
    [LoadState.InFlight]: 'In air',
    [LoadState.Landed]: 'Landed',
  };
  return (
    <Card
      testID="load-card"
      style={{
        margin: 16,
        borderRadius: 2,
        opacity: ['cancelled', 'landed'].includes(load?.state || '') ? 0.5 : 1.0,
      }}
      elevation={3}
      onPress={onPress}
    >
      <Badge
        style={{
          backgroundColor: load?.state ? LOAD_BADGE_COLOR[load.state] : undefined,
          marginTop: -5,
          marginRight: -5,
        }}
      >
        {load?.state ? loadStates[load?.state] : ''}
      </Badge>
      <Card.Title
        style={{ justifyContent: 'space-between' }}
        title={`Load #${load?.loadNumber}`}
        subtitle={load?.name}
        right={() =>
          !load?.dispatchAt || isBefore(new Date(), load?.dispatchAt) ? null : (
            <View style={{ marginRight: 16 }}>
              <Countdown end={new Date(load?.dispatchAt * 1000)} />
            </View>
          )
        }
      />

      <Card.Content style={[styles.cardContent]}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', backgroundColor: 'transparent' }}>
          <PlaneChip
            value={load?.plane}
            small
            color={theme.colors.onSurface}
            onSelect={async (plane) => {
              if ((load?.occupiedSlots || 0) > (plane.maxSlots || 0)) {
                const diff = (load?.occupiedSlots || 0) - (plane.maxSlots || 0);

                dispatch(
                  actions.notifications.showSnackbar({
                    message: `You need to take ${diff} people off the load to fit on this plane`,
                    variant: 'warning',
                  })
                );
              } else {
                await updatePlane(plane);
                refetch();
              }
            }}
          />
          <PilotChip
            color={theme.colors.onSurface}
            value={load?.pilot}
            onSelect={updatePilot}
            small
          />
          <Chip
            mode="outlined"
            icon="parachute"
            style={{
              marginHorizontal: 4,
              backgroundColor: 'transparent',
              height: 25,
              alignItems: 'center',
              borderColor: theme.colors.onSurface,
            }}
            textStyle={{ color: theme.colors.onSurface, fontSize: 12 }}
          >
            {load?.occupiedSlots || 0} / {load?.plane?.maxSlots}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  cardContent: {
    marginVertical: 8,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  smallChip: {
    height: 25,
    margin: 4,
    alignItems: 'center',
  },
  smallChipText: { fontSize: 12 },
});
