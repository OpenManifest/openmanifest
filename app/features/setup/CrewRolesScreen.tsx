import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Permission } from 'app/api/schema.d';
import type { CrewRoleEssentialsFragment } from 'app/api/operations';
import { useCrewRoles } from 'app/api/crud';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import CrewRoleDialog from 'app/forms/crew_role/Dialog';
import useRestriction from 'app/hooks/useRestriction';
import useTerms from 'app/i18n/useTerms';
import { useOperatorContext } from 'app/providers/operator/context';
import { ResourceList } from 'app/ui';
import { crewRoleFacts } from './lists';
import { useRefetchOnFocus, useResourceEditor } from './useResourceEditor';

/** The jobs on a load (pilot, ground control, guide) and who may fill them (Setup → Operations, `/configuration/crew-roles`) */
export default function CrewRolesScreen() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const {
    operator: { operator },
  } = useOperatorContext();
  const { crewRoles, loading, refetch, archive } = useCrewRoles();
  useRefetchOnFocus(refetch, !operator?.id);
  const canEdit = useRestriction(Permission.UpdateOperator);
  const editor = useResourceEditor<CrewRoleEssentialsFragment>({
    archive: canEdit ? archive : undefined,
    nameOf: (role) => role.name,
  });

  return (
    <ScreenContainer edges={['bottom']} testID="crew-roles">
      <ResourceList<CrewRoleEssentialsFragment>
        testID="crew-roles-list"
        intro={t('resources.crewIntro', { load: term('load').toLowerCase() })}
        items={crewRoles}
        loading={loading}
        onRefresh={refetch}
        keyOf={(role) => role.id}
        titleOf={(role) => role.name}
        factsOf={(role) => crewRoleFacts(role, t, term)}
        iconOf={() => 'account-hard-hat-outline'}
        onOpen={canEdit ? editor.openItem : undefined}
        rowTestID={(role) => `crew-role-${role.key}`}
        create={
          canEdit
            ? {
                label: t('forms.crew_role.new'),
                onPress: editor.openNew,
                testID: 'new-crew-role-primary-action',
              }
            : undefined
        }
        empty={{
          icon: 'account-hard-hat-outline',
          title: t('resources.empty', { items: t('setupMenu.crewRolesTitle').toLowerCase() }),
          body: t('resources.crewEmpty', { load: term('load').toLowerCase() }),
        }}
      >
        <CrewRoleDialog
          open={!!editor.editing}
          original={editor.editing?.original}
          onClose={editor.close}
          onArchive={editor.onArchive}
        />
      </ResourceList>
    </ScreenContainer>
  );
}
