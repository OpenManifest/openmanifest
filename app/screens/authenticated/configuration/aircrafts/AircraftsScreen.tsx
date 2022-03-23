import * as React from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FAB, DataTable, ProgressBar, useTheme } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/core';
import { useArchivePlaneMutation, usePlanesQuery } from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';

import { actions, useAppDispatch, useAppSelector } from 'app/state';
import NoResults from 'app/components/NoResults';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import PlaneDialog from 'app/components/dialogs/Plane';
import useRestriction from 'app/hooks/useRestriction';
import SwipeActions from 'app/components/layout/SwipeActions';

export default function PlanesScreen() {
  const global = useAppSelector((root) => root.global);
  const state = useAppSelector((root) => root.forms.plane);
  const { data, loading, refetch } = usePlanesQuery({
    variables: {
      dropzoneId: Number(global.currentDropzoneId),
    },
  });

  const [deletePlane] = useArchivePlaneMutation();
  const dispatch = useAppDispatch();

  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  const canDeletePlane = useRestriction(Permission.DeletePlane);
  const canCreatePlane = useRestriction(Permission.CreatePlane);
  const theme = useTheme();
  return (
    <>
      <ScrollableScreen
        contentContainerStyle={{ backgroundColor: theme.colors.surface }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
      >
        <ProgressBar visible={loading} color={global.theme.colors.primary} />

        {data?.planes?.length ? null : (
          <NoResults
            title="No planes?"
            subtitle="You need to have at least one plane to manifest loads"
          />
        )}

        {!data?.planes?.length ? null : (
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Name</DataTable.Title>
              <DataTable.Title numeric>Registration</DataTable.Title>
              <DataTable.Title numeric>Slots</DataTable.Title>
            </DataTable.Header>
            {data?.planes?.map((plane) => (
              <SwipeActions
                key={`plane-${plane.id}`}
                disabled={!canDeletePlane}
                rightAction={{
                  label: 'Delete',
                  backgroundColor: 'red',
                  onPress: async () => {
                    const { data: result } = await deletePlane({
                      variables: { id: Number(plane.id) },
                    });

                    if (result?.deletePlane?.errors?.length) {
                      dispatch(
                        actions.notifications.showSnackbar({
                          message: result.deletePlane.errors[0],
                          variant: 'error',
                        })
                      );
                    }
                  },
                }}
              >
                <DataTable.Row
                  pointerEvents="none"
                  onPress={() => {
                    dispatch(actions.forms.plane.setOpen(plane));
                  }}
                >
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
          onPress={() => dispatch(actions.forms.plane.setOpen(true))}
          label="New plane"
        />
      </ScrollableScreen>
      <PlaneDialog open={state.open} onClose={() => dispatch(actions.forms.plane.setOpen(false))} />
    </>
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
