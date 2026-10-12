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
import { useVehicles } from 'app/api/crud';
import { useOperatorContext } from 'app/providers/operator/context';
import { VehicleEssentialsFragment } from 'app/api/operations';
import { useNotifications } from 'app/providers/notifications';
import { useAppTheme } from 'app/theme';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';

export default function VehiclesScreen() {
  const { theme } = useAppTheme();
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const { dialogs } = useOperatorContext();
  const { vehicles, archive, loading, refetch } = useVehicles({
    operatorId: currentOperatorId?.toString() as string,
  });

  const notify = useNotifications();

  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  const canDeleteVehicle = useRestriction(Permission.DeleteVehicle);
  const canCreateVehicle = useRestriction(Permission.CreateVehicle);

  const createArchiveVehicleHandler = React.useCallback(
    (vehicle: VehicleEssentialsFragment) => {
      return async function ArchiveVehicleHandler() {
        const response = await archive(vehicle);

        if ('error' in response && response.error) {
          notify.error(response.error);
        } else {
          notify.success(`Archived aircraft ${vehicle.name}`);
        }
      };
    },
    [archive, notify]
  );

  const createEditVehicleHandler = React.useCallback(
    (vehicle: VehicleEssentialsFragment) => {
      return function ArchiveVehicleHandler() {
        dialogs.vehicle.open({ original: vehicle });
      };
    },
    [dialogs.vehicle]
  );
  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollableScreen
        hasFab
        contentContainerStyle={{ backgroundColor: theme.colors.surface }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <ProgressBar visible={loading} color={theme.colors.primary} />

        {vehicles?.length ? null : (
          <NoResults
            title="No planes?"
            subtitle="You need to have at least one plane to manifest loads"
          />
        )}

        {!vehicles?.length ? null : (
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Name</DataTable.Title>
              <DataTable.Title numeric>Registration</DataTable.Title>
              <DataTable.Title numeric>Slots</DataTable.Title>
            </DataTable.Header>
            {vehicles?.map((vehicle) => (
              <View style={{ minHeight: 46 }}>
                <SwipeActions
                  key={`vehicle-${vehicle.id}`}
                  disabled={!canDeleteVehicle}
                  rightAction={{
                    label: 'Delete',
                    backgroundColor: 'red',
                    onPress: createArchiveVehicleHandler(vehicle),
                  }}
                >
                  <DataTable.Row pointerEvents="none" onPress={createEditVehicleHandler(vehicle)}>
                    <DataTable.Cell>{vehicle.name}</DataTable.Cell>
                    <DataTable.Cell numeric>{vehicle.registration}</DataTable.Cell>
                    <DataTable.Cell numeric>{vehicle.capacity}</DataTable.Cell>
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
          testID="new-vehicle-primary-action"
          style={{ backgroundColor: theme.colors.primary }}
          visible={canCreateVehicle}
          small
          icon="plus"
          onPress={() => dialogs.vehicle.open()}
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
