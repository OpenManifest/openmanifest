import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB, DataTable, ProgressBar } from 'react-native-paper';
import { useTicketTypeExtrasQuery } from 'app/api/reflection';
import { View } from 'app/components/Themed';
import { Permission } from 'app/api/schema.d';

import { useAppSelector } from 'app/state';
import NoResults from 'app/components/NoResults';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import useRestriction from 'app/hooks/useRestriction';
import { TicketTypeAddonDetailsFragment } from 'app/api/operations';

export default function ExtrasScreen() {
  const { dropzone: currentDropzone, dialogs } = useDropzoneContext();
  const globalState = useAppSelector((root) => root.global);
  const { data, loading } = useTicketTypeExtrasQuery({
    variables: {
      dropzoneId: currentDropzone?.dropzone?.id as string
    }
  });
  const createEditHandler = React.useCallback(
    (ticketTypeAddon: TicketTypeAddonDetailsFragment) => () =>
      dialogs.ticketTypeAddon.open({ original: ticketTypeAddon }),
    [dialogs.ticketTypeAddon]
  );
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
            <DataTable.Row onPress={createEditHandler(extra)} pointerEvents="none">
              <DataTable.Cell>{extra.name}</DataTable.Cell>
              <DataTable.Cell numeric>${extra.cost}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
        {!loading && !data?.extras?.length && (
          <NoResults
            title="No ticket addons"
            subtitle="You can add multiple addons to assign to tickets, e.g outside camera, or coach"
          />
        )}

        <FAB
          style={[styles.fab, { backgroundColor: globalState.theme.colors.primary }]}
          visible={canCreateExtras}
          small
          icon="plus"
          onPress={dialogs.ticketTypeAddon.open}
          label="New ticket addon"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    display: 'flex'
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  }
});
