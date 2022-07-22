import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB, DataTable, ProgressBar } from 'react-native-paper';
import { useTicketTypeExtrasQuery } from 'app/api/reflection';
import { View } from 'app/components/Themed';
import { Permission } from 'app/api/schema.d';

import { actions, useAppDispatch, useAppSelector } from 'app/state';
import NoResults from 'app/components/NoResults';
import TicketTypeExtraDialog from 'app/components/dialogs/TicketTypeExtra';
import { useDropzoneContext } from 'app/api/crud/useDropzone';
import useRestriction from 'app/hooks/useRestriction';

export default function ExtrasScreen() {
  const currentDropzone = useDropzoneContext();
  const globalState = useAppSelector((root) => root.global);
  const formState = useAppSelector((root) => root.forms.extra);
  const { data, loading } = useTicketTypeExtrasQuery({
    variables: {
      dropzoneId: Number(currentDropzone?.dropzone?.id),
    },
  });
  const dispatch = useAppDispatch();
  const canCreateExtras = useRestriction(Permission.CreateExtra);

  return (
    <>
      <ProgressBar visible={loading} indeterminate color={globalState.theme.colors.primary} />
      <View style={styles.container}>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title numeric>Cost</DataTable.Title>
          </DataTable.Header>

          {data?.extras?.map((extra) => (
            <DataTable.Row
              onPress={() => {
                dispatch(actions.forms.extra.setOpen(extra));
              }}
              pointerEvents="none"
            >
              <DataTable.Cell>{extra.name}</DataTable.Cell>
              <DataTable.Cell numeric>${extra.cost}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
        {!loading && !data?.extras?.length && (
          <NoResults
            title="No ticket addons"
            // eslint-disable-next-line max-len
            subtitle="You can add multiple addons to assign to tickets, e.g outside camera, or coach"
          />
        )}

        <FAB
          style={[styles.fab, { backgroundColor: globalState.theme.colors.primary }]}
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
    display: 'flex',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});
