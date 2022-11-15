import * as React from 'react';
import { StyleSheet, RefreshControl, View } from 'react-native';
import { FAB, DataTable, ProgressBar, Switch } from 'react-native-paper';
import { Permission } from 'app/api/schema.d';

import { useAppSelector } from 'app/state';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import SwipeActions from 'app/components/layout/SwipeActions';
import useRestriction from 'app/hooks/useRestriction';
import { useTickets } from 'app/api/crud';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { TicketTypeEssentialsFragment } from 'app/api/operations';
import { useNotifications } from 'app/providers/notifications';

export default function TicketTypesScreen() {
  const state = useAppSelector((root) => root.global);
  const notify = useNotifications();
  const {
    dropzone: { dropzone },
    dialogs,
  } = useDropzoneContext();
  const { ticketTypes, loading, refetch, archiveTicketType, updateTicketType } = useTickets({
    dropzone: dropzone?.id,
  });

  const canCreateTicketTypes = useRestriction(Permission.CreateTicketType);

  const createArchiveTicketHandler = React.useCallback(
    (ticket: TicketTypeEssentialsFragment) => {
      return async function ArchiveTicketType() {
        const response = await archiveTicketType(ticket);

        if ('error' in response && response.error) {
          notify.error(response.error);
        } else {
          notify.success(`Archived ${ticket.name}`);
        }
      };
    },
    [archiveTicketType, notify]
  );

  const createToggleManifestSelfHandler = React.useCallback(
    (ticket: TicketTypeEssentialsFragment) => {
      return async function ToggleManifestSelf() {
        const response = await updateTicketType(Number(ticket.id), {
          allowManifestingSelf: !ticket.allowManifestingSelf,
        });

        if ('error' in response && response.error) {
          notify.error(response.error);
        } else {
          notify.success(`${ticket.name} can ${ticket.allowManifestingSelf ? 'no longer' : 'now'}`);
        }
      };
    },
    [notify, updateTicketType]
  );
  return (
    <ScrollableScreen
      style={styles.container}
      contentContainerStyle={[styles.content, { backgroundColor: 'white' }]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
    >
      <ProgressBar visible={loading} color={state.theme.colors.primary} />
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Name</DataTable.Title>
          <DataTable.Title numeric>Cost</DataTable.Title>
          <DataTable.Title numeric>Altitude</DataTable.Title>
          <DataTable.Title numeric>Public</DataTable.Title>
        </DataTable.Header>

        {ticketTypes?.map((ticketType) => (
          <SwipeActions
            rightAction={{
              label: 'Delete',
              backgroundColor: 'red',
              onPress: createArchiveTicketHandler(ticketType),
            }}
          >
            <DataTable.Row
              onPress={() => {
                dialogs.ticketType.open({ original: ticketType });
              }}
              pointerEvents="none"
            >
              <DataTable.Cell>{ticketType.name}</DataTable.Cell>
              <DataTable.Cell numeric>${ticketType.cost}</DataTable.Cell>
              <DataTable.Cell numeric>{ticketType.altitude}</DataTable.Cell>
              <DataTable.Cell numeric>
                <View pointerEvents="box-none">
                  <Switch
                    onValueChange={createToggleManifestSelfHandler(ticketType)}
                    value={!!ticketType.allowManifestingSelf}
                  />
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          </SwipeActions>
        ))}
      </DataTable>

      <FAB
        small
        style={[styles.fab, { backgroundColor: state.theme.colors.primary }]}
        visible={canCreateTicketTypes}
        icon="plus"
        onPress={() => dialogs.ticketType.open()}
        label="New ticket type"
      />
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
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
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});
