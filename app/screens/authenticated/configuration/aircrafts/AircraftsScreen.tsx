import * as React from 'react';
import { StyleSheet, RefreshControl, View } from 'react-native';
import { FAB, DataTable } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';
import { useIsFocused } from '@react-navigation/native';
import { Permission } from 'app/api/schema.d';

import { useSession } from 'app/state';
import NoResults from 'app/components/NoResults';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import useRestriction from 'app/hooks/useRestriction';
import SwipeActions from 'app/components/layout/SwipeActions';
import { useAircrafts } from 'app/api/crud';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { PlaneEssentialsFragment } from 'app/api/operations';
import { useNotifications } from 'app/providers/notifications';
import { useAppTheme } from 'app/theme';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';

export default function PlanesScreen() {
  const { theme } = useAppTheme();
  const currentDropzoneId = useSession((session) => session.currentDropzoneId);
  const { dialogs } = useDropzoneContext();
  const { aircrafts, archive, loading, refetch } = useAircrafts({
    dropzoneId: currentDropzoneId?.toString() as string,
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
    <ScreenContainer edges={['bottom']}>
      <ScrollableScreen
        hasFab
        contentContainerStyle={{ backgroundColor: theme.colors.surface }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <ProgressBar visible={loading} color={theme.colors.primary} />

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
              <View style={{ minHeight: 46 }}>
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
              </View>
            ))}
          </DataTable>
        )}
      </ScrollableScreen>
      <FloatingActionArea>
        <FAB
          labelMaxFontSizeMultiplier={CHROME_MAX_FONT_SIZE_MULTIPLIER}
          testID="new-plane-primary-action"
          style={{ backgroundColor: theme.colors.primary }}
          visible={canCreatePlane}
          small
          icon="plus"
          onPress={() => dialogs.aircraft.open()}
          label="New plane"
        />
      </FloatingActionArea>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
