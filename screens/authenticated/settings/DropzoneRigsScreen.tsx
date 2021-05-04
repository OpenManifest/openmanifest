import { useQuery } from '@apollo/client';
import { useIsFocused,  } from '@react-navigation/core';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FAB, DataTable, ProgressBar } from 'react-native-paper';
import { Query } from "../../../graphql/schema";

import { useAppSelector, useAppDispatch, rigForm } from '../../../redux';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import { format } from 'date-fns';
import RigDialog from '../../../components/dialogs/Rig';


const QUERY_DROPZONE_RIGS = gql`
  query QueryDropzoneRigs(
    $dropzoneId: Int!
  ) {
    rigs(dropzoneId: $dropzoneId) {
      id
      make
      model
      serial
      rigType
      repackExpiresAt
      canopySize
      packValue
    }
  }
`;

export default function DropzoneRigsScreen() {
  const state = useAppSelector(state => state.global);
  const [rigDialogOpen, setRigDialogOpen] = React.useState(false);
  const { data, loading, refetch } = useQuery<Query>(QUERY_DROPZONE_RIGS, {
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
      <ScrollableScreen style={styles.container} contentContainerStyle={[styles.content, {  backgroundColor: "white" }]} refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}>
      <ProgressBar visible={loading} color={state.theme.colors.accent} />
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>
              Container
            </DataTable.Title>
            <DataTable.Title numeric>
              Repack due
            </DataTable.Title>
            <DataTable.Title numeric>
              Canopy size
            </DataTable.Title>
            <DataTable.Title numeric>
              Type
            </DataTable.Title>
          </DataTable.Header>

          {
            data?.rigs?.map((rig) =>
              <DataTable.Row
                key={`rig-${rig!.id}`}
                onPress={() => {
                  dispatch(rigForm.setOriginal(rig));
                  setRigDialogOpen(true);
                }}
                pointerEvents="none"
              >
                <DataTable.Cell>
                  {[rig?.make, rig?.model, `#${rig?.serial}`].join(" ")}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  {rig?.repackExpiresAt ? format(rig.repackExpiresAt * 1000, "yyyy/MM/dd") : "-"}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  {`${rig?.canopySize}`}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  {rig.rigType}
                </DataTable.Cell>
              </DataTable.Row>
            )
          }
        </DataTable>

        <RigDialog
          onClose={() => setRigDialogOpen(false)}
          onSuccess={() => {
            setRigDialogOpen(false);
            refetch();
          }}
          dropzoneId={Number(state.currentDropzone?.id)}
          open={rigDialogOpen}
        />
        
        <FAB
          style={styles.fab}
          small
          icon="plus"
          onPress={() =>
            setRigDialogOpen(true)
          }
          label="New rig"
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
