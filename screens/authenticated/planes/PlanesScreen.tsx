import { useMutation, useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FAB, DataTable, ProgressBar } from 'react-native-paper';
import { Mutation, Query } from "../../../graphql/schema";

import { useIsFocused } from '@react-navigation/core';
import { actions, useAppDispatch, useAppSelector } from '../../../redux';
import NoResults from '../../../components/NoResults';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import PlaneDialog from '../../../components/dialogs/Plane';
import useRestriction from '../../../hooks/useRestriction';
import SwipeActions from '../../../components/layout/SwipeActions';


const QUERY_PLANES = gql`
  query QueryPlanes(
    $dropzoneId: Int!
  ) {
    dropzone(id: $dropzoneId) {
      id
      planes {
        id
        name
        registration
        hours
        minSlots
        maxSlots
        nextMaintenanceHours
        createdAt
      }
    }
  }
`;


const MUTATION_DELETE_PLANE = gql`
mutation DeletePlane($id: Int!) {
  deletePlane(input: { id: $id }) {
    errors
    plane {
      id
      dropzone {
        id
        planes {
          name
          registration
          hours
          minSlots
          maxSlots
          nextMaintenanceHours
          createdAt
        }
      }
    }
  }
}
`;
export default function PlanesScreen() {
  const global = useAppSelector(state => state.global);
  const state = useAppSelector(state => state.forms.plane);
  const { data, loading, refetch } = useQuery<Query>(QUERY_PLANES, {
    variables: {
      dropzoneId: Number(global.currentDropzone?.id)
    }
  });

  const [deletePlane, mutation] = useMutation<Mutation>(MUTATION_DELETE_PLANE);
  const dispatch = useAppDispatch();

  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);
 

  const canDeletePlane = useRestriction("deletePlane");

  return (
    <>
    <ScrollableScreen refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}>
      <ProgressBar visible={loading} color={global.theme.colors.accent} />
        

          {
            data?.dropzone?.planes?.length ? null : (
              <NoResults
                title="No planes?"
                subtitle="You need to have at least one plane to manifest loads"
              />
            )
          }

          { !data?.dropzone?.planes?.length ? null : (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Name</DataTable.Title>
                <DataTable.Title numeric>Registration</DataTable.Title>
                <DataTable.Title numeric>Slots</DataTable.Title>
              </DataTable.Header>
              {
                data?.dropzone?.planes?.map((plane) =>
                <SwipeActions
                  disabled={!canDeletePlane}
                  rightAction={{
                    label: "Delete",
                    backgroundColor: "red",
                    onPress: async () => {
                      const { data: result } = await deletePlane({ variables: { id: Number(plane.id )}});
                      
                      if (result?.deletePlane?.errors?.length) {
                        dispatch(
                          actions.notifications.showSnackbar({
                            message: result.deletePlane.errors[0],
                            variant: "error"
                          })
                        );
                      }
                    }
                  }}>
                    <DataTable.Row
                      pointerEvents="none"
                      onPress={() => {
                        dispatch(actions.forms.plane.setOpen(plane));
                      }}
                    >
                      <DataTable.Cell>{plane.name}</DataTable.Cell>
                      <DataTable.Cell numeric>{plane.registration}</DataTable.Cell>
                      <DataTable.Cell numeric>
                        {plane.maxSlots}
                      </DataTable.Cell>
                    </DataTable.Row>
                  </SwipeActions>
              )}
            </DataTable>
          )}
          
      <FAB
        style={styles.fab}
        small
        icon="plus"
        onPress={() => dispatch(actions.forms.plane.setOpen(true))}
        label="New plane"
      />
    </ScrollableScreen>
    <PlaneDialog
      open={state.open}
      onClose={() => dispatch(actions.forms.plane.setOpen(false))}
    />
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%"
  }
});
