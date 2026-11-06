import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Permission } from 'app/api/schema.d';
import type { EquipmentEssentialsFragment } from 'app/api/operations';
import {
  AvailableEquipmentDocument,
  MembershipsDetailedDocument,
  OperatorEquipmentDocument,
  useArchiveEquipmentMutation,
  useOperatorEquipmentQuery,
  useUpdateEquipmentMutation,
} from 'app/api/reflection';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import EquipmentDialog from 'app/forms/equipment';
import { schemaOf, summarize, type AttributeValues } from 'app/forms/equipment/attributes';
import useRestriction from 'app/hooks/useRestriction';
import { formatDate } from 'app/i18n/format';
import { useOperatorFormat } from 'app/i18n/operatorFormat';
import useTerms from 'app/i18n/useTerms';
import { useNotifications } from 'app/providers/notifications';
import { useOperatorContext } from 'app/providers/operator/context';
import { ResourceList, Switch, type ResourceFact } from 'app/ui';
import { useRefetchOnFocus, useResourceEditor } from './useResourceEditor';

/** The make, model and serial of an item, else its name or kind */
function titleOf(equipment: EquipmentEssentialsFragment) {
  return (
    [equipment.make, equipment.model, equipment.serial ? `#${equipment.serial}` : null]
      .filter(Boolean)
      .join(' ') ||
    equipment.name ||
    equipment.equipmentKind?.name ||
    ''
  );
}

/** The equipment the operator owns and hires out (Setup → Operations, `/configuration/equipment`) */
export default function EquipmentScreen() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const notify = useNotifications();
  const units = useOperatorFormat((state) => state.units);
  const {
    operator: { operator },
  } = useOperatorContext();
  const kinds = React.useMemo(() => operator?.equipmentKinds ?? [], [operator?.equipmentKinds]);
  const { data, loading, refetch } = useOperatorEquipmentQuery({
    variables: { operatorId: operator?.id as string },
    skip: !operator?.id,
  });
  useRefetchOnFocus(refetch, !operator?.id);
  const [updateEquipment] = useUpdateEquipmentMutation();
  const [archiveEquipment] = useArchiveEquipmentMutation();
  const canCreate = useRestriction(Permission.CreateOperatorEquipment);
  const canUpdate = useRestriction(Permission.UpdateOperatorEquipment);
  const canDelete = useRestriction(Permission.DeleteOperatorEquipment);

  const archive = React.useCallback(
    async (equipment: EquipmentEssentialsFragment) => {
      const response = await archiveEquipment({
        variables: { id: Number(equipment.id) },
        refetchQueries: [OperatorEquipmentDocument, AvailableEquipmentDocument],
      });
      const payload = response.data?.archiveEquipment;
      return payload?.equipment
        ? { equipment: payload.equipment }
        : { error: payload?.errors?.[0] };
    },
    [archiveEquipment]
  );
  const editor = useResourceEditor<EquipmentEssentialsFragment>({
    archive: canDelete ? archive : undefined,
    nameOf: titleOf,
  });

  const togglePublic = async (equipment: EquipmentEssentialsFragment) => {
    const { data: result } = await updateEquipment({
      variables: { id: Number(equipment.id), isPublic: !equipment.isPublic },
      refetchQueries: [AvailableEquipmentDocument, MembershipsDetailedDocument],
    });
    if (result?.updateEquipment?.errors?.length) notify.error(result.updateEquipment.errors[0]);
  };

  const factsOf = (equipment: EquipmentEssentialsFragment): ResourceFact[] => {
    const kind = kinds.find((candidate) => candidate.id === equipment.equipmentKind?.id);
    const details = summarize(
      schemaOf(kind?.attributeSchema),
      equipment.attributes as AttributeValues,
      {
        operatorOwned: true,
        units,
      }
    );
    return [
      kind ? { label: t('resources.facts.kind'), value: kind.name } : null,
      equipment.serviceDueAt
        ? { label: term('service_due'), value: formatDate(equipment.serviceDueAt) }
        : null,
      details ? { label: t('forms.equipment.details'), value: details } : null,
    ].filter((fact): fact is ResourceFact => !!fact);
  };
  const equipmentWord = { equipment: term('equipment').toLowerCase() };

  return (
    <ScreenContainer edges={['bottom']} testID="equipment">
      <ResourceList<EquipmentEssentialsFragment>
        testID="equipment-list"
        items={data?.operator?.equipment ?? []}
        loading={loading}
        onRefresh={refetch}
        keyOf={(equipment) => equipment.id}
        titleOf={titleOf}
        factsOf={factsOf}
        iconOf={() => 'toolbox-outline'}
        trailingOf={(equipment) => (
          <Switch
            label={t('forms.equipment.public')}
            value={!!equipment.isPublic}
            disabled={!canUpdate}
            onChange={() => togglePublic(equipment)}
            testID={`equipment-${equipment.id}-public`}
          />
        )}
        onOpen={canUpdate ? editor.openItem : undefined}
        rowTestID={(equipment) => `equipment-${equipment.id}`}
        create={
          canCreate
            ? {
                label: t('forms.equipment.newEquipment', equipmentWord),
                onPress: editor.openNew,
                testID: 'new-equipment-primary-action',
              }
            : undefined
        }
        empty={{
          icon: 'toolbox-outline',
          title: t('resources.empty', { items: term('equipment', 2).toLowerCase() }),
          body: t('resources.equipmentEmpty', equipmentWord),
        }}
      >
        <EquipmentDialog
          open={!!editor.editing}
          equipment={editor.editing?.original}
          operatorId={Number(operator?.id)}
          onClose={editor.close}
          onSuccess={() => refetch()}
          onArchive={editor.onArchive}
        />
      </ResourceList>
    </ScreenContainer>
  );
}
