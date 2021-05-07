import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Card, Title, FAB, Paragraph, List, DataTable, ProgressBar } from 'react-native-paper';
import { View } from '../../../components/Themed';
import { Query } from "../../../graphql/schema";

import { useNavigation, useRoute } from '@react-navigation/core';
import { extraForm, useAppDispatch, useAppSelector } from '../../../redux';
import NoResults from '../../../components/NoResults';
import TicketTypeExtraDialog from '../../../components/dialogs/TicketTypeExtra';
import usePalette from '../../../hooks/usePalette';
import global from '../../../redux/global';


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
  const state = useAppSelector(state => state.global);
  const { data, loading, refetch } = useQuery<Query>(QUERY_TICKET_TYPE, {
    variables: {
      dropzoneId: Number(state.currentDropzone?.id)
    }
  });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const dispatch = useAppDispatch();

  return (
    <>
    <ProgressBar visible={loading} indeterminate color={state.theme.colors.accent} />
    <View style={styles.container}>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title numeric>Cost</DataTable.Title>
        </DataTable.Header>

        { data?.dropzone?.extras?.map((extra) =>
          <DataTable.Row
            onPress={() => {
              dispatch(extraForm.setOriginal(extra));
              setDialogOpen(true);
            }}
            pointerEvents="none"
          >
            <DataTable.Cell>{extra.name}</DataTable.Cell>
            <DataTable.Cell numeric>{extra.cost}</DataTable.Cell>
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
        small
        icon="plus"
        onPress={() => setDialogOpen(true)}
        label="New ticket addon"
      />
    </View>
    <TicketTypeExtraDialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
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
