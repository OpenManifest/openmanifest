import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB, DataTable, ProgressBar } from 'react-native-paper';
import { View } from '../../../components/Themed';
import { Permission, Query } from "../../../graphql/schema.d";

import { actions, useAppDispatch, useAppSelector } from '../../../redux';
import NoResults from '../../../components/NoResults';
import TicketTypeExtraDialog from '../../../components/dialogs/TicketTypeExtra';
import useCurrentDropzone from '../../../graphql/hooks/useCurrentDropzone';
import useRestriction from '../../../hooks/useRestriction';


const QUERY_TICKET_TYPE = gql`
  query QueryExtra(
    $dropzoneId: Int!
  ) {
    dropzone(id: $dropzoneId) {
      id
      extras {
        id
        cost
        name
        ticketTypes {
          id
          altitude
          name
        }
      }
    }
  }
`;

export default function ExtrasScreen() {
  const currentDropzone = useCurrentDropzone();
  const globalState = useAppSelector(state => state.global);
  const formState = useAppSelector(state => state.forms.extra);
  const { data, loading, refetch } = useQuery<Query>(QUERY_TICKET_TYPE, {
    variables: {
      dropzoneId: Number(currentDropzone?.dropzone?.id)
    }
  });
  const dispatch = useAppDispatch();
  const canCreateExtras = useRestriction(Permission.CreateExtra);

  return (
    <>
    <ProgressBar visible={loading} indeterminate color={globalState.theme.colors.accent} />
    <View style={styles.container}>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title numeric>Cost</DataTable.Title>
        </DataTable.Header>

        { data?.dropzone?.extras?.map((extra) =>
          <DataTable.Row
            onPress={() => {
              dispatch(actions.forms.extra.setOpen(extra));
            }}
            pointerEvents="none"
          >
            <DataTable.Cell>{extra.name}</DataTable.Cell>
            <DataTable.Cell numeric>${extra.cost}</DataTable.Cell>
          </DataTable.Row>
        )}
      </DataTable>
      { !loading && !data?.dropzone?.extras?.length && (
          <NoResults
            title="No ticket addons"
            subtitle="You can add multiple addons to assign to tickets, e.g outside camera, or coach"
          />
      )}
      
      <FAB
        style={styles.fab}
        visible={canCreateExtras}
        small
        icon="plus"
        onPress={() => dispatch(actions.forms.extra.setOpen(true))}
        label="New ticket addon"
      />
    </View>
    <TicketTypeExtraDialog
      open={formState.open}
      onClose={() => dispatch(actions.forms.extra.setOpen(false))}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    display: "flex"
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
