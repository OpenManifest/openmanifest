import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FAB, DataTable } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';
import { format } from 'date-fns';
import { Switch } from 'react-native-gesture-handler';
import {
  AvailableRigsDocument,
  MembershipsDetailedDocument,
  useOperatorRigsQuery,
  useUpdateEquipmentMutation,
} from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';

import { useSession } from 'app/state';
import createUseDialog from 'app/providers/hooks/useDialog';
import type { RigEssentialsFragment } from 'app/api/operations';
import FormColumn from 'app/components/layout/FormColumn';
import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import RigDialog from 'app/forms/rig';
import useRestriction from 'app/hooks/useRestriction';
import { useNotifications } from 'app/providers/notifications';
import { useAppTheme } from 'app/theme';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';

const useRigDialog = createUseDialog<{ rig?: RigEssentialsFragment }>();

export default function OperatorRigsScreen() {
  const { theme } = useAppTheme();
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const rigDialog = useRigDialog();
  const notify = useNotifications();
  const { data, loading, refetch } = useOperatorRigsQuery({
    variables: {
      operatorId: currentOperatorId?.toString() as string,
    },
  });
  const isFocused = useIsFocused();
  const [mutationUpdateEquipment, updateData] = useUpdateEquipmentMutation();

  const canCreateEquipment = useRestriction(Permission.CreateOperatorRig);

  React.useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  return (
    <ScreenContainer edges={['bottom']}>
      <FormColumn
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

          {data?.operator?.rigs?.map((rig) => (
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
                    const { data: result } = await mutationUpdateEquipment({
                      variables: {
                        id: Number(rig.id),
                        isPublic: !rig.isPublic,
                      },
                      refetchQueries: [AvailableRigsDocument, MembershipsDetailedDocument],
                    });

                    if (result?.updateEquipment?.errors?.length) {
                      notify.error(result?.updateEquipment.errors[0]);
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
          operatorId={Number(currentOperatorId)}
          open={rigDialog.visible}
          rig={rigDialog.state?.rig}
        />
      </FormColumn>
      <FloatingActionArea>
        <FAB
          labelMaxFontSizeMultiplier={CHROME_MAX_FONT_SIZE_MULTIPLIER}
          testID="new-rig-primary-action"
          visible={canCreateEquipment}
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
