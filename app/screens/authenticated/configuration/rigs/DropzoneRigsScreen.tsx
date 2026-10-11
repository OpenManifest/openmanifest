import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FAB, DataTable } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';
import { format } from 'date-fns';
import { Switch } from 'react-native-gesture-handler';
import {
  AvailableRigsDocument,
  DropzoneUsersDetailedDocument,
  useDropzoneRigsQuery,
  useUpdateRigMutation,
} from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';

import { useSession } from 'app/state';
import createUseDialog from 'app/providers/hooks/useDialog';
import type { RigEssentialsFragment } from 'app/api/operations';
import ScrollableScreen from 'app/components/layout/ScrollableScreen';
import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import RigDialog from 'app/forms/rig';
import useRestriction from 'app/hooks/useRestriction';
import { useNotifications } from 'app/providers/notifications';
import { useAppTheme } from 'app/theme';

const useRigDialog = createUseDialog<{ rig?: RigEssentialsFragment }>();

export default function DropzoneRigsScreen() {
  const { theme } = useAppTheme();
  const currentDropzoneId = useSession((session) => session.currentDropzoneId);
  const rigDialog = useRigDialog();
  const notify = useNotifications();
  const { data, loading, refetch } = useDropzoneRigsQuery({
    variables: {
      dropzoneId: currentDropzoneId?.toString() as string,
    },
  });
  const isFocused = useIsFocused();
  const [mutationUpdateRig, updateData] = useUpdateRigMutation();

  const canCreateRig = useRestriction(Permission.CreateDropzoneRig);

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  return (
    <ScreenContainer edges={['bottom']}>
      <ScrollableScreen
        hasFab
        style={styles.container}
        contentContainerStyle={[styles.content, { backgroundColor: theme.colors.surface }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refetch()} />}
      >
        <ProgressBar visible={loading || updateData.loading} color={theme.colors.primary} />
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
                  rigDialog.open({ rig });
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
          onClose={rigDialog.close}
          onSuccess={() => refetch()}
          dropzoneId={Number(currentDropzoneId)}
          open={rigDialog.visible}
          rig={rigDialog.state?.rig}
        />
      </ScrollableScreen>
      <FloatingActionArea>
        <FAB
          testID="new-rig-primary-action"
          visible={canCreateRig}
          style={{ backgroundColor: theme.colors.primary }}
          small
          icon="plus"
          onPress={() => rigDialog.open({})}
          label="New rig"
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
