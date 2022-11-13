import { useIsFocused } from '@react-navigation/core';
import * as React from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FAB, DataTable, ProgressBar, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { Switch } from 'react-native-gesture-handler';
import {
  AvailableRigsDocument,
  DropzoneUsersDetailedDocument,
  useDropzoneRigsQuery,
  useUpdateRigMutation,
} from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';

import { actions, useAppSelector, useAppDispatch } from 'app/state';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import RigDialog from 'app/components/dialogs/Rig';
import useRestriction from 'app/hooks/useRestriction';
import { useNotifications } from 'app/providers/notifications';

export default function DropzoneRigsScreen() {
  const state = useAppSelector((root) => root.global);
  const rigForm = useAppSelector((root) => root.forms.rig);
  const notify = useNotifications();
  const { data, loading, refetch } = useDropzoneRigsQuery({
    variables: {
      dropzoneId: state.currentDropzoneId?.toString() as string,
    },
  });
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const [mutationUpdateRig, updateData] = useUpdateRigMutation();

  const canCreateRig = useRestriction(Permission.CreateDropzoneRig);
  const theme = useTheme();

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  return (
    <ScrollableScreen
      style={styles.container}
      contentContainerStyle={[styles.content, { backgroundColor: 'white' }]}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
    >
      <ProgressBar visible={loading || updateData.loading} color={state.theme.colors.primary} />
      <DataTable>
        <DataTable.Header>
          <DataTable.Title>Container</DataTable.Title>
          <DataTable.Title numeric>Repack due</DataTable.Title>
          <DataTable.Title numeric>Canopy size</DataTable.Title>
          <DataTable.Title numeric>Type</DataTable.Title>
          <DataTable.Title numeric>Public</DataTable.Title>
        </DataTable.Header>

        {data?.dropzone?.rigs?.map((rig) => (
          <DataTable.Row key={`rig-${rig.id}`}>
            <DataTable.Cell
              onPress={() => {
                dispatch(actions.forms.rig.setOpen(rig));
              }}
            >
              {[rig?.make, rig?.model, `#${rig?.serial}`].join(' ')}
            </DataTable.Cell>
            <DataTable.Cell numeric>
              {rig?.repackExpiresAt ? format(rig.repackExpiresAt * 1000, 'yyyy/MM/dd') : '-'}
            </DataTable.Cell>
            <DataTable.Cell numeric>{`${rig?.canopySize}`}</DataTable.Cell>
            <DataTable.Cell numeric>{rig.rigType}</DataTable.Cell>
            <DataTable.Cell numeric>
              <Switch
                onValueChange={async () => {
                  const { data: result } = await mutationUpdateRig({
                    variables: {
                      id: Number(rig.id),
                      isPublic: !rig.isPublic,
                    },
                    refetchQueries: [AvailableRigsDocument, DropzoneUsersDetailedDocument],
                  });

                  if (result?.updateRig?.errors?.length) {
                    notify.error(result?.updateRig.errors[0]);
                  }
                }}
                value={!!rig.isPublic}
              />
            </DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>

      <RigDialog
        onClose={() => dispatch(actions.forms.rig.setOpen(false))}
        onSuccess={() => {
          dispatch(actions.forms.rig.setOpen(false));
          refetch();
        }}
        dropzoneId={Number(state.currentDropzoneId)}
        open={rigForm.open}
      />

      <FAB
        visible={canCreateRig}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        small
        icon="plus"
        onPress={() => dispatch(actions.forms.rig.setOpen(true))}
        label="New rig"
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
