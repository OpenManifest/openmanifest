import { useMutation, useQuery } from '@apollo/client';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FAB, DataTable, ProgressBar, Switch } from 'react-native-paper';
import { Mutation, Query } from "../../../graphql/schema";

import { useAppSelector } from '../../../redux';
import ScrollableScreen from '../../../components/ScrollableScreen';


const QUERY_TICKET_TYPE = gql`
  query QueryTicketType(
    $dropzoneId: Int!
  ) {
    ticketTypes(dropzoneId: $dropzoneId) {
      id
      cost
      currency
      name
      altitude
      allowManifestingSelf

      extras {
        id
        name
      }
    }
  }
`;

const MUTATION_UPDATE_TICKET_TYPE = gql`
  mutation UpdateTicketTypePublic(
    $id: Int!,
    $allowManifestingSelf: Boolean
  ){
    updateTicketType(input: {
      id: $id
      attributes: {
        allowManifestingSelf: $allowManifestingSelf
      }
    }) {
      ticketType {
        id
        name
        altitude
        cost
        allowManifestingSelf
        extras {
          id
          name
          cost
        }
      }
    }
  }
`;

export default function TicketTypesScreen() {
  const state = useAppSelector(state => state.global);
  const { data, loading, refetch } = useQuery<Query>(QUERY_TICKET_TYPE, {
    variables: {
      dropzoneId: Number(state.currentDropzone?.id)
    }
  });
  const navigation = useNavigation();
  const route = useRoute();
  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);
  const [mutationUpdateTicketType, mutation] = useMutation<Mutation>(MUTATION_UPDATE_TICKET_TYPE);
  
  React.useEffect(() => {
    if (route.name === "TicketTypesScreen") {
      refetch();
    }
  }, [route.name])
  return (
      <ScrollableScreen style={styles.container} contentContainerStyle={[styles.content, {  backgroundColor: "white" }]} refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}>
      <ProgressBar visible={loading} color={state.theme.colors.accent} />
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title numeric>Cost</DataTable.Title>
            <DataTable.Title numeric>Altitude</DataTable.Title>
            <DataTable.Title numeric>Public</DataTable.Title>
          </DataTable.Header>

          { data?.ticketTypes?.map((ticketType) =>
            <DataTable.Row onPress={() => navigation.navigate("UpdateTicketTypeScreen", { ticketType })} pointerEvents="none">
              <DataTable.Cell>{ticketType.name}</DataTable.Cell>
              <DataTable.Cell numeric>${ticketType.cost}</DataTable.Cell>
              <DataTable.Cell numeric>
                {ticketType.altitude}
              </DataTable.Cell>
              <DataTable.Cell numeric>
                <Switch
                  onValueChange={() => {
                    mutationUpdateTicketType({
                      variables: {
                        id: Number(ticketType.id),
                        allowManifestingSelf: !ticketType.allowManifestingSelf
                      }
                    })
                  }}
                  value={!!ticketType.allowManifestingSelf}
                />
              </DataTable.Cell>
            </DataTable.Row>
            )}
        </DataTable>
        
        <FAB
          style={styles.fab}
          small
          icon="plus"
          onPress={() => navigation.navigate("CreateTicketTypeScreen")}
          label="New ticket type"
        />
      </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex"
  },
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
