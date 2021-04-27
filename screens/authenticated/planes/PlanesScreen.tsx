import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, FAB, Paragraph, List, DataTable, ProgressBar } from 'react-native-paper';
import { View } from '../../../components/Themed';
import { Query } from "../../../graphql/schema";

import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import { useAppSelector } from '../../../redux';
import NoResults from '../../../components/NoResults';
import ScrollableScreen from '../../../components/ScrollableScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';


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
  const { data, loading, refetch } = useQuery<Query>(QUERY_PLANES, {
    variables: {
      dropzoneId: Number(state.currentDropzone?.id)
    }
  });
  const navigation = useNavigation();

  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);
 

  return (
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
                    onPress={() => navigation.navigate("UpdatePlaneScreen", { plane })}
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
        onPress={() => navigation.navigate("CreatePlaneScreen")}
        label="New plane"
      />
    </ScrollableScreen>
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
