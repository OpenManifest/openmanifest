import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Permission } from 'app/api/schema.d';
import type { TicketTypeAddonDetailsFragment } from 'app/api/operations';
import { useTicketTypeExtrasQuery } from 'app/api/reflection';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import TicketTypeAddonDialog from 'app/forms/ticket_type_addon/Dialog';
import useRestriction from 'app/hooks/useRestriction';
import { useOperatorContext } from 'app/providers/operator/context';
import { ResourceList } from 'app/ui';
import { extraFacts } from './lists';
import { useRefetchOnFocus, useResourceEditor } from './useResourceEditor';

/** What is sold with a ticket, such as a coach or a camera (`/ticket-types/extra`); extras are not archived */
export default function ExtrasScreen() {
  const { t } = useTranslation('common');
  const {
    operator: { operator },
  } = useOperatorContext();
  const { data, loading, refetch } = useTicketTypeExtrasQuery({
    variables: { operatorId: operator?.id as string },
    skip: !operator?.id,
  });
  useRefetchOnFocus(refetch, !operator?.id);
  const canCreate = useRestriction(Permission.CreateExtra);
  const canUpdate = useRestriction(Permission.UpdateExtra);
  const editor = useResourceEditor<TicketTypeAddonDetailsFragment>({
    nameOf: (extra) => extra.name ?? '',
  });

  return (
    <ScreenContainer edges={['bottom']} testID="extras">
      <ResourceList<TicketTypeAddonDetailsFragment>
        testID="extras-list"
        items={(data?.extras ?? []) as TicketTypeAddonDetailsFragment[]}
        loading={loading}
        onRefresh={refetch}
        keyOf={(extra) => extra.id}
        titleOf={(extra) => extra.name ?? ''}
        factsOf={(extra) => extraFacts(extra, t)}
        iconOf={() => 'plus-box-outline'}
        onOpen={canUpdate ? editor.openItem : undefined}
        rowTestID={(extra) => `extra-${extra.id}`}
        create={
          canCreate
            ? {
                label: t('forms.ticket_type_addon.newTicket'),
                onPress: editor.openNew,
                testID: 'new-ticket-addon-primary-action',
              }
            : undefined
        }
        empty={{
          icon: 'plus-box-outline',
          title: t('resources.empty', { items: t('screens.ticketAddOns').toLowerCase() }),
          body: t('resources.extrasEmpty'),
        }}
      >
        <TicketTypeAddonDialog
          open={!!editor.editing}
          original={editor.editing?.original ?? undefined}
          onClose={() => {
            editor.close();
            refetch();
          }}
        />
      </ResourceList>
    </ScreenContainer>
  );
}
