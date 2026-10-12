import * as React from 'react';
import { useOperatorContext } from 'app/providers/operator/context';
import {
  DestinationsDocument,
  useArchiveDestinationMutation,
  useCreateDestinationMutation,
  useDestinationsQuery,
  useUpdateDestinationMutation,
} from '../reflection';
import {
  CreateDestinationMutationVariables,
  DestinationEssentialsFragment,
  UpdateDestinationMutationVariables,
} from '../operations';
import { TMutationResponse } from './factory';

type DestinationResponse = TMutationResponse<{ destination: DestinationEssentialsFragment }>;

/** The places the current operator's loads go to, and creating, changing and archiving them */
export function useDestinations() {
  const {
    operator: { operator },
  } = useOperatorContext();
  const operatorId = operator?.id?.toString();
  const { data, loading, refetch } = useDestinationsQuery({
    variables: { operatorId: operatorId as string },
    skip: !operatorId,
  });
  const [createMutation] = useCreateDestinationMutation();
  const [updateMutation] = useUpdateDestinationMutation();
  const [archiveMutation] = useArchiveDestinationMutation();
  const refetchQueries = React.useMemo(
    () => [{ query: DestinationsDocument, variables: { operatorId } }],
    [operatorId]
  );

  const create = React.useCallback(
    async (
      attributes: Omit<CreateDestinationMutationVariables['attributes'], 'operatorId'>
    ): Promise<DestinationResponse> => {
      const response = await createMutation({
        variables: { attributes: { ...attributes, operatorId: Number(operatorId) } },
        refetchQueries,
      });
      const payload = response.data?.createDestination;
      return payload?.destination
        ? { destination: payload.destination }
        : { error: payload?.errors?.[0], fieldErrors: payload?.fieldErrors ?? undefined };
    },
    [createMutation, operatorId, refetchQueries]
  );

  const update = React.useCallback(
    async (
      id: number,
      attributes: UpdateDestinationMutationVariables['attributes']
    ): Promise<DestinationResponse> => {
      const response = await updateMutation({ variables: { id, attributes }, refetchQueries });
      const payload = response.data?.updateDestination;
      return payload?.destination
        ? { destination: payload.destination }
        : { error: payload?.errors?.[0], fieldErrors: payload?.fieldErrors ?? undefined };
    },
    [updateMutation, refetchQueries]
  );

  const archive = React.useCallback(
    async (destination: DestinationEssentialsFragment): Promise<DestinationResponse> => {
      const response = await archiveMutation({
        variables: { id: Number(destination.id) },
        refetchQueries,
      });
      const payload = response.data?.archiveDestination;
      return payload?.destination
        ? { destination: payload.destination }
        : { error: payload?.errors?.[0], fieldErrors: payload?.fieldErrors ?? undefined };
    },
    [archiveMutation, refetchQueries]
  );

  return React.useMemo(
    () => ({
      destinations: data?.operator?.destinations ?? [],
      loading,
      refetch,
      create,
      update,
      archive,
    }),
    [data?.operator?.destinations, loading, refetch, create, update, archive]
  );
}

export default useDestinations;
