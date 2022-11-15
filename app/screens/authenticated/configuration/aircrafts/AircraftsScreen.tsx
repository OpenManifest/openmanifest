import * as React from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FAB, DataTable, ProgressBar, useTheme } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/core';
import { Permission } from 'app/api/schema.d';

import { useAppSelector } from 'app/state';
import NoResults from 'app/components/NoResults';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import useRestriction from 'app/hooks/useRestriction';
import SwipeActions from 'app/components/layout/SwipeActions';
import { useAircrafts } from 'app/api/crud';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { PlaneEssentialsFragment } from 'app/api/operations';
import { useNotifications } from 'app/providers/notifications';

export default function PlanesScreen() {
  const global = useAppSelector((root) => root.global);
  const { dialogs } = useDropzoneContext();
  const { aircrafts, archive, loading, refetch } = useAircrafts({
    dropzoneId: global.currentDropzoneId?.toString() as string,
  });

  const notify = useNotifications();

  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  const canDeletePlane = useRestriction(Permission.DeletePlane);
  const canCreatePlane = useRestriction(Permission.CreatePlane);
  const theme = useTheme();

  const createArchiveAircraftHandler = React.useCallback(
    (aircraft: PlaneEssentialsFragment) => {
      return async function ArchiveAircraftHandler() {
        const response = await archive(aircraft);

        if ('error' in response && response.error) {
          notify.error(response.error);
        } else {
          notify.success(`Archived aircraft ${aircraft.name}`);
        }
      };
    },
    [archive, notify]
  );

  const createEditAircraftHandler = React.useCallback(
    (aircraft: PlaneEssentialsFragment) => {
      return function ArchiveAircraftHandler() {
        dialogs.aircraft.open({ original: aircraft });
      };
    },
    [dialogs.aircraft]
  );
  return (
    <ScrollableScreen
      contentContainerStyle={{ backgroundColor: theme.colors.surface }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
    >
      <ProgressBar visible={loading} color={global.theme.colors.primary} />

      {aircrafts?.length ? null : (
        <NoResults
          title="No planes?"
          subtitle="You need to have at least one plane to manifest loads"
        />
      )}

      {!aircrafts?.length ? null : (
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title numeric>Registration</DataTable.Title>
            <DataTable.Title numeric>Slots</DataTable.Title>
          </DataTable.Header>
          {aircrafts?.map((plane) => (
            <SwipeActions
              key={`plane-${plane.id}`}
              disabled={!canDeletePlane}
              rightAction={{
                label: 'Delete',
                backgroundColor: 'red',
                onPress: createArchiveAircraftHandler(plane),
              }}
            >
              <DataTable.Row pointerEvents="none" onPress={createEditAircraftHandler(plane)}>
                <DataTable.Cell>{plane.name}</DataTable.Cell>
                <DataTable.Cell numeric>{plane.registration}</DataTable.Cell>
                <DataTable.Cell numeric>{plane.maxSlots}</DataTable.Cell>
              </DataTable.Row>
            </SwipeActions>
          ))}
        </DataTable>
      )}

      <FAB
        style={[styles.fab, { backgroundColor: global.theme.colors.primary }]}
        visible={canCreatePlane}
        small
        icon="plus"
        onPress={dialogs.aircraft.open}
        label="New plane"
      />
    </ScrollableScreen>
  );
}

const styles = StyleSheet.create({
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
