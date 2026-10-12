import * as React from 'react';
import { noop } from 'lodash';
import sameVariables from 'app/utils/sameVariables';
import { useOperatorContext } from 'app/providers/operator/context';
import { useAuthenticated } from 'app/state';
import {
  useCreateTicketTypeMutation,
  useCreateTicketAddonMutation,
  useUpdateTicketAddonMutation,
  useUpdateTicketTypeMutation,
  useArchiveTicketTypeMutation,
  TicketTypesDocument,
  TicketTypeExtrasDocument,
  useTicketTypesLazyQuery,
} from '../reflection';
import {
  CreateTicketAddonMutationVariables,
  CreateTicketTypeMutationVariables,
  TicketTypeAddonDetailsFragment,
  TicketTypeEssentialsFragment,
  TicketTypesQueryVariables,
  UpdateTicketAddonMutationVariables,
  UpdateTicketTypeMutationVariables,
} from '../operations';
import { TMutationResponse, uninitializedHandler } from './factory';

export function useTickets(vars?: Partial<TicketTypesQueryVariables>) {
  const authenticated = useAuthenticated();
  const variables: TicketTypesQueryVariables | undefined = React.useMemo(() => {
    if (vars?.operator) {
      return vars as TicketTypesQueryVariables;
    }
    return undefined;
  }, [vars]);

  const [getTickets, query] = useTicketTypesLazyQuery();
  React.useEffect(() => {
    if (authenticated && variables?.operator && !sameVariables(variables, query.variables)) {
      getTickets({ variables });
    }
  }, [authenticated, getTickets, query.variables, variables]);

  const {
    operator: { operator },
  } = useOperatorContext();
  const { loading, fetchMore, data, called, variables: queryVariables } = query;
  const ticketTypes = React.useMemo(() => data?.ticketTypes, [data?.ticketTypes]);
  const [createTicket] = useCreateTicketTypeMutation();
  const [updateTicket] = useUpdateTicketTypeMutation();
  const [archiveTicket] = useArchiveTicketTypeMutation();
  const [createAddon] = useCreateTicketAddonMutation();
  const [updateAddon] = useUpdateTicketAddonMutation();

  const refetch = React.useCallback(() => {
    if (variables?.operator) {
      query?.refetch();
    }
  }, [query, variables]);

  const createTicketType = React.useCallback(
    async function CreateTicketType(
      attributes: Omit<CreateTicketTypeMutationVariables['attributes'], 'operatorId'>
    ): Promise<TMutationResponse<{ ticketType: TicketTypeEssentialsFragment }>> {
      const response = await createTicket({
        variables: {
          attributes: { ...attributes, operatorId: Number(variables?.operator || operator?.id) },
        },
        refetchQueries: [{ query: TicketTypesDocument, variables: { operator: operator?.id } }],
      });

      if (response?.data?.createTicketType?.ticketType?.id) {
        return { ticketType: response?.data?.createTicketType?.ticketType };
      }
      return {
        error: response?.data?.createTicketType?.errors?.[0],
        fieldErrors: response?.data?.createTicketType?.fieldErrors || undefined,
      };
    },
    [createTicket, operator?.id, variables?.operator]
  );

  const updateTicketType = React.useCallback(
    async function UpdateTicketType(
      id: number,
      attributes: Omit<UpdateTicketTypeMutationVariables['attributes'], 'operatorId'>
    ): Promise<TMutationResponse<{ ticketType: TicketTypeEssentialsFragment }>> {
      const response = await updateTicket({
        variables: { id, attributes: { ...attributes } },
      });

      if (response?.data?.updateTicketType?.ticketType?.id) {
        return { ticketType: response?.data?.updateTicketType?.ticketType };
      }
      return {
        error: response?.data?.updateTicketType?.errors?.[0],
        fieldErrors: response?.data?.updateTicketType?.fieldErrors || undefined,
      };
    },
    [updateTicket]
  );

  const createTicketTypeAddon = React.useCallback(
    async function CreateTicketTypeAddon(
      attributes: Omit<CreateTicketAddonMutationVariables['attributes'], 'operatorId'>
    ): Promise<TMutationResponse<{ ticketTypeAddon: TicketTypeAddonDetailsFragment }>> {
      const response = await createAddon({
        variables: {
          attributes: { ...attributes, operatorId: Number(variables?.operator || operator?.id) },
        },
        refetchQueries: [
          {
            query: TicketTypeExtrasDocument,
            variables: { operatorId: operator?.id },
            fetchPolicy: 'network-only',
          },
        ],
      });

      if (response?.data?.createExtra?.extra?.id) {
        return { ticketTypeAddon: response?.data?.createExtra?.extra };
      }
      return {
        error: response?.data?.createExtra?.errors?.[0],
        fieldErrors: response?.data?.createExtra?.fieldErrors || undefined,
      };
    },
    [createAddon, operator?.id, variables?.operator]
  );

  const updateTicketTypeAddon = React.useCallback(
    async function UpdateTicketTypeAddon(
      id: number,
      attributes: Omit<UpdateTicketAddonMutationVariables['attributes'], 'operatorId'>
    ): Promise<TMutationResponse<{ ticketTypeAddon: TicketTypeAddonDetailsFragment }>> {
      const response = await updateAddon({
        variables: { id, attributes: { ...attributes } },
      });

      if (response?.data?.updateExtra?.extra?.id) {
        return { ticketTypeAddon: response?.data?.updateExtra?.extra };
      }
      return {
        error: response?.data?.updateExtra?.errors?.[0],
        fieldErrors: response?.data?.updateExtra?.fieldErrors || undefined,
      };
    },
    [updateAddon]
  );

  const archiveTicketType = React.useCallback(
    async function ArchiveTicket(
      ticketType: TicketTypeEssentialsFragment
    ): Promise<TMutationResponse<{ ticketType: TicketTypeEssentialsFragment }>> {
      const response = await archiveTicket({
        variables: { id: Number(ticketType.id) },
        optimisticResponse: {
          archiveTicketType: {
            __typename: 'DeleteTicketPayload',
            errors: null,
            fieldErrors: null,
            ticketType,
          },
        },
        update: (cache, { data: mutationData }) => {
          if (!mutationData?.archiveTicketType?.ticketType?.id) {
            return;
          }

          cache.evict({ id: cache.identify(mutationData.archiveTicketType.ticketType) });
        },
      });

      if (response?.data?.archiveTicketType?.ticketType?.id) {
        return { ticketType: response?.data?.archiveTicketType?.ticketType };
      }
      return {
        error: response?.data?.archiveTicketType?.errors?.[0],
        fieldErrors: response?.data?.archiveTicketType?.fieldErrors || undefined,
      };
    },
    [archiveTicket]
  );

  return React.useMemo(
    () => ({
      loading,
      called,
      refetch: queryVariables?.operator ? refetch : noop,
      fetchMore: queryVariables?.operator ? () => fetchMore({ variables }) : uninitializedHandler,
      ticketTypes,
      createTicketType,
      createTicketTypeAddon,
      updateTicketType,
      updateTicketTypeAddon,
      archiveTicketType,
    }),
    [
      loading,
      called,
      queryVariables?.operator,
      refetch,
      ticketTypes,
      createTicketType,
      createTicketTypeAddon,
      updateTicketType,
      updateTicketTypeAddon,
      archiveTicketType,
      fetchMore,
      variables,
    ]
  );
}
