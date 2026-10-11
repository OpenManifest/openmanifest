import * as React from 'react';
import { StyleSheet, RefreshControl, View } from 'react-native';
import { FAB, DataTable, Switch } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';
import { Permission } from 'app/api/schema.d';

import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import SwipeActions from 'app/components/layout/SwipeActions';
import useRestriction from 'app/hooks/useRestriction';
import { useTickets } from 'app/api/crud';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { TicketTypeEssentialsFragment } from 'app/api/operations';
import { useNotifications } from 'app/providers/notifications';
import { useAppTheme } from 'app/theme';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';
import { formatCents } from 'app/utils/money';

export default function TicketTypesScreen() {
  const { theme } = useAppTheme();
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
    <ScreenContainer edges={['bottom']}>
      <ScrollableScreen
        hasFab
        style={styles.container}
        contentContainerStyle={[styles.content, { backgroundColor: theme.colors.surface }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <ProgressBar visible={loading} color={theme.colors.primary} />
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title numeric>Cost</DataTable.Title>
            <DataTable.Title numeric>Altitude</DataTable.Title>
            <DataTable.Title numeric>Public</DataTable.Title>
          </DataTable.Header>

          {ticketTypes?.map((ticketType) => (
            <View style={{ minHeight: 46 }}>
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
                  <DataTable.Cell numeric>{formatCents(ticketType.costCents)}</DataTable.Cell>
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
            </View>
          ))}
        </DataTable>
      </ScrollableScreen>
      <FloatingActionArea>
        <FAB
          labelMaxFontSizeMultiplier={CHROME_MAX_FONT_SIZE_MULTIPLIER}
          testID="new-ticket-type-primary-action"
          small
          style={{ backgroundColor: theme.colors.primary }}
          visible={canCreateTicketTypes}
          icon="plus"
          onPress={() => dialogs.ticketType.open()}
          label="New ticket type"
        />
      </FloatingActionArea>
    </ScreenContainer>
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
});
