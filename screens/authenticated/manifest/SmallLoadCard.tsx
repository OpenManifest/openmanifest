import { gql, useMutation, useQuery } from '@apollo/client';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { Badge, Card, Chip } from 'react-native-paper';

import useCurrentDropzone from '../../../graphql/hooks/useCurrentDropzone';
import PilotChip from '../../../components/chips/PilotChip';
import PlaneChip from '../../../components/chips/PlaneChip';

import { View } from '../../../components/Themed';
import { Query, Load, Mutation, Plane, DropzoneUser, LoadState } from '../../../graphql/schema.d';
import { actions, useAppDispatch } from '../../../redux';
import { errorColor, successColor, warningColor } from '../../../constants/Colors';
import Countdown from './Countdown';
import { isBefore } from 'date-fns';

interface ILoadCard {
  load: Load;
  onPress(): void;
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
      state
      plane {
        id
        name
        maxSlots
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
            exitWeight
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
        state
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


const LOAD_BADGE_COLOR = {
  open: successColor,
  cancelled: errorColor,
  boarding_call: warningColor,
};

export default function LoadCard(props: ILoadCard) {
  const dispatch = useAppDispatch();

  const { load, onPress } = props;
  const { data, loading, refetch } = useQuery<Query>(QUERY_LOAD, {
    variables: {
      id: Number(load.id),
    },
    pollInterval: process.env.EXPO_ENV === "production" ? 30000 : null,
  });
  const currentDropzone = useCurrentDropzone();

  const [mutationUpdateLoad, mutation] = useMutation<Mutation>(MUTATION_UPDATE_LOAD);

  const updatePilot = React.useCallback(async (pilot: DropzoneUser) => {
    try {
      await mutationUpdateLoad({ variables: { id: Number(load.id), pilotId: Number(pilot.id) }});
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);


  const updatePlane = React.useCallback(async (plane: Plane) => {
    try {
      await mutationUpdateLoad({ variables: { id: Number(load.id), planeId: Number(plane.id) }});
    } catch (e) {

    }
  }, [mutationUpdateLoad, JSON.stringify(load)]);
  
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
        opacity: ['cancelled', 'landed'].includes(data?.load?.state) ? 0.5 : 1.0
      }}
      elevation={3}
      onPress={onPress}
    >
      <Badge
        style={{
          backgroundColor: LOAD_BADGE_COLOR[data?.load?.state],
          marginTop: -5,
          marginRight: -5,
        }}
      >
        {loadStates[data?.load?.state] || ''}
      </Badge>
      <Card.Title
        style={{ justifyContent: "space-between" }}
        title={`Load #${load.loadNumber}`}
        subtitle={load.name}
        right={() => !data?.load?.dispatchAt || isBefore(new Date(), data?.load?.dispatchAt) ? null : (
          <View style={{ marginRight: 16 }}>
            <Countdown end={new Date(data.load.dispatchAt * 1000)} />
          </View>
        )}
      />
      
      <Card.Content style={styles.cardContent}>
        <View style={{ flexDirection: "row", flexWrap: 'wrap' }}>
            <PlaneChip
              value={data?.load?.plane}
              small
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
            <PilotChip
              dropzoneId={Number(currentDropzone?.dropzone?.id)}
              value={data?.load?.pilot}
              onSelect={updatePilot}
              small
            />
            <Chip
              mode="outlined"
              icon="parachute"
              style={styles.smallChip}
              textStyle={styles.smallChipText}
            >
              {data?.load?.slots?.length} / {data?.load?.plane?.maxSlots}
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
