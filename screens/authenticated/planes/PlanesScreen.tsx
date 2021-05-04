import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FAB, DataTable, ProgressBar } from 'react-native-paper';
import { Query } from "../../../graphql/schema";

import { useIsFocused, useNavigation } from '@react-navigation/core';
import { planeForm, useAppDispatch, useAppSelector } from '../../../redux';
import NoResults from '../../../components/NoResults';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import PlaneDialog from '../../../components/dialogs/Plane';


const QUERY_PLANES = gql`
  query QueryPlanes(
    $dropzoneId: Int!
  ) {
    planes(dropzoneId: $dropzoneId) {
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
`;

export default function PlanesScreen() {
  const state = useAppSelector(state => state.global);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { data, loading, refetch } = useQuery<Query>(QUERY_PLANES, {
    variables: {
      dropzoneId: Number(state.currentDropzone?.id)
    }
  });
  const dispatch = useAppDispatch();

  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);
 

  return (
    <>
    <ScrollableScreen refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}>
      <ProgressBar visible={loading} color={state.theme.colors.accent} />
        

          {
            data?.planes?.length ? null : (
              <NoResults
                title="No planes?"
                subtitle="You need to have at least one plane to manifest loads"
              />
            )
          }

          { !data?.planes?.length ? null : (
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Name</DataTable.Title>
                <DataTable.Title numeric>Registration</DataTable.Title>
                <DataTable.Title numeric>Slots</DataTable.Title>
              </DataTable.Header>
              {
                data?.planes?.map((plane) =>
                  <DataTable.Row
                    pointerEvents="none"
                    onPress={() => {
                      dispatch(planeForm.setOriginal(plane));
                      setDialogOpen(true);
                    }}
                  >
                    <DataTable.Cell>{plane.name}</DataTable.Cell>
                    <DataTable.Cell numeric>{plane.registration}</DataTable.Cell>
                    <DataTable.Cell numeric>
                      {plane.maxSlots}
                    </DataTable.Cell>
                  </DataTable.Row>
              )}
            </DataTable>
          )}
          
      <FAB
        style={styles.fab}
        small
        icon="plus"
        onPress={() => setDialogOpen(true)}
        label="New plane"
      />
    </ScrollableScreen>
    <PlaneDialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
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
