import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Permission } from 'app/api/schema.d';
import type { EquipmentKindEssentialsFragment } from 'app/api/operations';
import { useEquipmentInspectionTemplateQuery } from 'app/api/reflection';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import {
  EquipmentInspectionTemplateForm,
  useEquipmentInspectionTemplateForm,
} from 'app/forms/equipment_inspection_template';
import useRestriction from 'app/hooks/useRestriction';
import useTerms from 'app/i18n/useTerms';
import { useOperatorContext } from 'app/providers/operator/context';
import { ResourceForm, ResourceList, Text } from 'app/ui';
import { equipmentKindFacts } from './lists';
import { useRefetchOnFocus, useResourceEditor } from './useResourceEditor';

/** The inspection form of one kind of equipment, its fields edited in place */
function InspectionFormDialog({
  kind,
  operatorId,
  canEdit,
  onClose,
}: {
  kind: EquipmentKindEssentialsFragment | null;
  operatorId?: string;
  canEdit: boolean;
  onClose(): void;
}) {
  const { t } = useTranslation('common');
  const { control, loading, onSubmit, reset } = useEquipmentInspectionTemplateForm({
    template: kind?.inspectionFormTemplate,
    operatorId,
    onSuccess: onClose,
  });
  React.useEffect(() => {
    if (!kind) reset();
  }, [kind, reset]);

  return (
    <ResourceForm
      open={!!kind}
      onClose={onClose}
      loading={loading}
      title={t('resources.inspectionFormOf', { kind: kind?.name ?? '' })}
      onSubmit={canEdit && kind?.inspectionFormTemplate ? onSubmit : undefined}
    >
      {kind?.inspectionFormTemplate ? (
        <EquipmentInspectionTemplateForm {...{ control }} />
      ) : (
        <Text tone="muted">{t('resources.noInspectionForm')}</Text>
      )}
    </ResourceForm>
  );
}

/**
 * The kinds of equipment of the operator and what an inspection of each checks (Setup → Operations,
 * `/configuration/equipment-inspection`). A row opens the kind's inspection form.
 */
export default function InspectionFormsScreen() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const {
    operator: { operator },
  } = useOperatorContext();
  const { data, loading, refetch } = useEquipmentInspectionTemplateQuery({
    variables: { operatorId: operator?.id as string },
    skip: !operator?.id,
  });
  useRefetchOnFocus(refetch, !operator?.id);
  const canEdit = useRestriction(Permission.UpdateFormTemplate);
  const editor = useResourceEditor<EquipmentKindEssentialsFragment>({ nameOf: (kind) => kind.name });

  return (
    <ScreenContainer edges={['bottom']} testID="inspection-forms">
      <ResourceList<EquipmentKindEssentialsFragment>
        testID="inspection-forms-list"
        intro={t('resources.inspectionIntro', { equipment: term('equipment').toLowerCase() })}
        items={data?.operator?.equipmentKinds ?? []}
        loading={loading}
        onRefresh={refetch}
        keyOf={(kind) => kind.id}
        titleOf={(kind) => kind.name}
        factsOf={(kind) => equipmentKindFacts(kind, t)}
        iconOf={(kind) =>
          kind.inspectionFormTemplate ? 'clipboard-check-outline' : 'clipboard-outline'
        }
        onOpen={editor.openItem}
        rowTestID={(kind) => `equipment-kind-${kind.key}`}
        empty={{
          icon: 'clipboard-outline',
          title: t('resources.empty', { items: term('equipment', 2).toLowerCase() }),
        }}
      >
        <InspectionFormDialog
          kind={editor.editing?.original ?? null}
          operatorId={data?.operator?.id}
          canEdit={canEdit}
          onClose={() => {
            editor.close();
            refetch();
          }}
        />
      </ResourceList>
    </ScreenContainer>
  );
}
