import { useMutation, useQuery } from '@apollo/client';
import { useIsFocused,  } from '@react-navigation/core';
import gql from 'graphql-tag';
import * as React from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FAB, DataTable, ProgressBar } from 'react-native-paper';
import { Mutation, Query } from "../../../graphql/schema";

import { actions, useAppSelector, useAppDispatch } from '../../../redux';
import ScrollableScreen from '../../../components/layout/ScrollableScreen';
import { format } from 'date-fns';
import RigDialog from '../../../components/dialogs/Rig';
import { Switch } from 'react-native-gesture-handler';


const QUERY_DROPZONE_RIGS = gql`
  query QueryDropzoneRigs(
    $dropzoneId: Int!
  ) {
    dropzone(id: $dropzoneId) {
      id
      rigs {
        id
        make
        isPublic
        model
        serial
        rigType
        repackExpiresAt
        canopySize
        packValue
      }
    }
  }
`;

const MUTATION_UPDATE_RIG = gql`
  mutation UpdateDropzoneRig(
    $id: Int!
    $isPublic: Boolean,
  ) {
    updateRig(
      input: {
        id: $id,
        attributes: {
          isPublic: $isPublic
        }
      }
    ) {
      errors
      fieldErrors {
        field
        message
      }
      rig {
        id
        make
        model
        serial
        isPublic
        canopySize
        repackExpiresAt
        packValue
        maintainedAt
        rigType

        dropzone {
          id
          rigs {
            id
            make
            model
            isPublic
            serial
            canopySize
            repackExpiresAt
            packValue
            maintainedAt
          }
        }
      }
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
  const [mutationUpdateRig, updateData] = useMutation<Mutation>(MUTATION_UPDATE_RIG);

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);

  return (
      <ScrollableScreen style={styles.container} contentContainerStyle={[styles.content, {  backgroundColor: "white" }]} refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}>
      <ProgressBar visible={loading || updateData.loading} color={state.theme.colors.accent} />
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
            <DataTable.Title numeric>
              Public
            </DataTable.Title>
          </DataTable.Header>

          {
            data?.dropzone?.rigs?.map((rig) =>
              <DataTable.Row key={`rig-${rig!.id}`}>
                <DataTable.Cell
                  onPress={() => {
                    dispatch(actions.forms.rig.setOriginal(rig));
                    setRigDialogOpen(true);
                  }}
                >
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
                  <DataTable.Cell numeric>
                    <Switch
                      onValueChange={async () => {
                        const { data: result } = await mutationUpdateRig({
                          variables: {
                            id: Number(rig.id),
                            isPublic: !rig.isPublic
                          }
                        });

                        if (result?.updateRig?.errors?.length) {
                          dispatch(
                            actions.notifications.showSnackbar({
                              message: result?.updateRig.errors[0],
                              variant: "error"
                            })
                          )
                        }
                      }}
                      value={!!rig.isPublic}
                    />
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
