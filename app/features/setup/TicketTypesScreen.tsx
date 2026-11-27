import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Permission } from 'app/api/schema.d';
import type { TicketTypeDetailsFragment } from 'app/api/operations';
import { useTickets } from 'app/api/crud';
import ScreenContainer from 'app/components/layout/ScreenContainer';
import TicketTypeDialog from 'app/forms/ticket_type/Dialog';
import useRestriction from 'app/hooks/useRestriction';
import useTerms from 'app/i18n/useTerms';
import { useOperatorContext } from 'app/providers/operator/context';
import { ResourceList } from 'app/ui';
import { ticketFacts } from './lists';
import { useRefetchOnFocus, useResourceEditor } from './useResourceEditor';

/** What a place on a load costs and who may book it (Setup → Operations, `/configuration/ticket-types`) */
export default function TicketTypesScreen() {
  const { t } = useTranslation('common');
  const term = useTerms();
  const {
    operator: { operator },
  } = useOperatorContext();
  const variables = React.useMemo(() => ({ operator: operator?.id }), [operator?.id]);
  const { ticketTypes, loading, refetch, archiveTicketType } = useTickets(variables);
  useRefetchOnFocus(refetch, !operator?.id);
  const canCreate = useRestriction(Permission.CreateTicketType);
  const canUpdate = useRestriction(Permission.UpdateTicketType);
  const canDelete = useRestriction(Permission.DeleteTicketType);
  const editor = useResourceEditor<TicketTypeDetailsFragment>({
    archive: canDelete ? archiveTicketType : undefined,
    nameOf: (ticket) => ticket.name ?? '',
  });

  return (
    <ScreenContainer edges={['bottom']} testID="ticket-types">
      <ResourceList<TicketTypeDetailsFragment>
        testID="ticket-types-list"
        items={ticketTypes ?? []}
        loading={loading}
        onRefresh={refetch}
        keyOf={(ticket) => ticket.id}
        titleOf={(ticket) => ticket.name ?? ''}
        factsOf={(ticket) => ticketFacts(ticket, t, term)}
        iconOf={() => 'ticket-outline'}
        onOpen={canUpdate ? editor.openItem : undefined}
        rowTestID={(ticket) => `ticket-type-${ticket.id}`}
        create={
          canCreate
            ? {
                label: t('forms.ticket_type.newTicket'),
                onPress: editor.openNew,
                testID: 'new-ticket-type-primary-action',
              }
            : undefined
        }
        empty={{
          icon: 'ticket-outline',
          title: t('resources.empty', { items: t('screens.ticketTypes').toLowerCase() }),
          body: t('resources.ticketsEmpty', { load: term('load').toLowerCase() }),
        }}
      >
        <TicketTypeDialog
          open={!!editor.editing}
          original={editor.editing?.original ?? undefined}
          onClose={editor.close}
          onArchive={editor.onArchive}
        />
      </ResourceList>
    </ScreenContainer>
  );
}
