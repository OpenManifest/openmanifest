import { useIsFocused } from '@react-navigation/native';
import * as React from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import { FAB, DataTable } from 'react-native-paper';
import ProgressBar from 'app/components/ProgressBar';
import { format } from 'date-fns';
import { Switch } from 'react-native-gesture-handler';
import {
  AvailableEquipmentDocument,
  MembershipsDetailedDocument,
  useOperatorEquipmentQuery,
  useUpdateEquipmentMutation,
} from 'app/api/reflection';
import { Permission } from 'app/api/schema.d';

import { useSession } from 'app/state';
import createUseDialog from 'app/providers/hooks/useDialog';
import type { EquipmentEssentialsFragment } from 'app/api/operations';
import FormColumn from 'app/components/layout/FormColumn';
import FloatingActionArea from 'app/components/layout/FloatingActionArea';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import EquipmentDialog from 'app/forms/equipment';
import useRestriction from 'app/hooks/useRestriction';
import { useNotifications } from 'app/providers/notifications';
import { useAppTheme } from 'app/theme';
import { useTranslation } from 'react-i18next';
import useTerms from 'app/i18n/useTerms';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import { useOperatorContext } from 'app/providers/operator/context';
import { schemaOf, summarize, type AttributeValues } from 'app/forms/equipment/attributes';
import { CHROME_MAX_FONT_SIZE_MULTIPLIER } from 'app/components/layout/fontScale';

const useEquipmentDialog = createUseDialog<{ equipment?: EquipmentEssentialsFragment }>();

export default function OperatorEquipmentScreen() {
  const { theme } = useAppTheme();
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const equipmentDialog = useEquipmentDialog();
  const { t } = useTranslation('common');
  const term = useTerms();
  const units = useOperatorFormat((state) => state.units);
  const {
    operator: { operator },
  } = useOperatorContext();
  const kinds = operator?.equipmentKinds ?? [];
  const notify = useNotifications();
  const { data, loading, refetch } = useOperatorEquipmentQuery({
    variables: {
      operatorId: currentOperatorId?.toString() as string,
    },
  });
  const isFocused = useIsFocused();
  const [mutationUpdateEquipment, updateData] = useUpdateEquipmentMutation();

  const canCreateEquipment = useRestriction(Permission.CreateOperatorEquipment);

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
            <DataTable.Title>{term('equipment')}</DataTable.Title>
            <DataTable.Title numeric>{term('service_due')}</DataTable.Title>
            <DataTable.Title numeric>{t('forms.equipment.details')}</DataTable.Title>
            <DataTable.Title numeric>{t('forms.equipment.public')}</DataTable.Title>
          </DataTable.Header>

          {data?.operator?.equipment?.map((equipment) => {
            const kind = kinds.find((candidate) => candidate.id === equipment.equipmentKind?.id);
            return (
              <DataTable.Row key={`equipment-${equipment.id}`}>
                <DataTable.Cell
                  onPress={() => {
                    equipmentDialog.open({ equipment });
                  }}
                >
                  {[
                    equipment?.make,
                    equipment?.model,
                    equipment?.serial ? `#${equipment.serial}` : null,
                  ]
                    .filter(Boolean)
                    .join(' ') ||
                    equipment.name ||
                    kind?.name}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  {equipment?.serviceDueAt
                    ? format(equipment.serviceDueAt * 1000, 'yyyy/MM/dd')
                    : '-'}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  {summarize(
                    schemaOf(kind?.attributeSchema),
                    equipment.attributes as AttributeValues,
                    {
                      operatorOwned: true,
                      units,
                    }
                  )}
                </DataTable.Cell>
                <DataTable.Cell numeric>
                  <Switch
                    onValueChange={async () => {
                      const { data: result } = await mutationUpdateEquipment({
                        variables: {
                          id: Number(equipment.id),
                          isPublic: !equipment.isPublic,
                        },
                        refetchQueries: [AvailableEquipmentDocument, MembershipsDetailedDocument],
                      });

                      if (result?.updateEquipment?.errors?.length) {
                        notify.error(result?.updateEquipment.errors[0]);
                      }
                    }}
                    value={!!equipment.isPublic}
                  />
                </DataTable.Cell>
              </DataTable.Row>
            );
          })}
        </DataTable>

        <EquipmentDialog
          onClose={equipmentDialog.close}
          onSuccess={() => refetch()}
          operatorId={Number(currentOperatorId)}
          open={equipmentDialog.visible}
          equipment={equipmentDialog.state?.equipment}
        />
      </FormColumn>
      <FloatingActionArea>
        <FAB
          labelMaxFontSizeMultiplier={CHROME_MAX_FONT_SIZE_MULTIPLIER}
          testID="new-equipment-primary-action"
          visible={canCreateEquipment}
          style={{ backgroundColor: theme.colors.primary }}
          small
          icon="plus"
          onPress={() => equipmentDialog.open({})}
          label={t('forms.equipment.newEquipment', { equipment: term('equipment').toLowerCase() })}
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
