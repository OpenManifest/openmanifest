import { useMutation, useQuery } from '@apollo/client';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/core';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FAB, DataTable, ProgressBar, Switch } from 'react-native-paper';
import { Mutation, Query } from "../../../graphql/schema";

import { snackbarActions, ticketTypeForm, useAppDispatch, useAppSelector } from '../../../redux';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import TicketTypesDialog from '../../../components/dialogs/TicketType';
import SwipeActions from '../../../components/layout/SwipeActions';

const QUERY_TICKET_TYPE = gql`
  query QueryTicketType(
    $dropzoneId: Int!
  ) {
    dropzone(id: $dropzoneId) {
      id
      ticketTypes {
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
        isTandem
        extras {
          id
          name
          cost
        }
      }
    }
  }
`;

const MUTATION_DELETE_TICKET_TYPE = gql`
  mutation DeleteTicketType(
    $id: Int!,
  ){
    deleteTicketType(input: {
      id: $id
    }) {
      ticketType {
        id
        dropzone {
          id
          ticketTypes {
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
      }
      errors
    }
  }
`;

export default function TicketTypesScreen() {
  const state = useAppSelector(state => state.global);
  const dispatch = useAppDispatch();
  const [dialogOpen, setDialogOpen] = React.useState(false);
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
  const [mutationDeleteTicketType, mutationDelete] = useMutation<Mutation>(MUTATION_DELETE_TICKET_TYPE);
  
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

          { data?.dropzone?.ticketTypes?.map((ticketType) =>
          <SwipeActions
            rightAction={{
              label: "Delete",
              backgroundColor: "red",
              onPress: async () => {
                const { data: result } = await mutationDeleteTicketType({ variables: { id: Number(ticketType.id) }});

                if (result?.deleteTicketType?.errors?.length) {
                  dispatch(
                    snackbarActions.showSnackbar({
                      message: result?.deleteTicketType?.errors[0],
                      variant: "error"
                    })
                  );
                }
              }
            }}
          >
            <DataTable.Row
              onPress={() => {
                dispatch(ticketTypeForm.setOriginal(ticketType));
                setDialogOpen(true);
              }}
              pointerEvents="none"
            >
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
            </SwipeActions>
            )}
        </DataTable>
        
        <FAB
          style={styles.fab}
          small
          icon="plus"
          onPress={() => setDialogOpen(true)}
          label="New ticket type"
        />
        <TicketTypesDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
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
