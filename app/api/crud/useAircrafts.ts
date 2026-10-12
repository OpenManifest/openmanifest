import * as React from 'react';
import { noop } from 'lodash';
import sameVariables from 'app/utils/sameVariables';
import { useOperatorContext } from 'app/providers/operator/context';
import { useAuthenticated } from 'app/state';
import {
  useCreateAircraftMutation,
  useUpdateAircraftMutation,
  PlanesDocument,
  useArchivePlaneMutation,
  usePlanesLazyQuery,
} from '../reflection';
import {
  CreateAircraftMutationVariables,
  PlanesQuery,
  OperatorQueryVariables,
  PlaneEssentialsFragment,
  PlanesQueryVariables,
  UpdateAircraftMutationVariables,
} from '../operations';
import { TMutationResponse, uninitializedHandler } from './factory';

export function useAircrafts(vars?: Partial<PlanesQueryVariables>) {
  const authenticated = useAuthenticated();
  const variables: OperatorQueryVariables | undefined = React.useMemo(() => {
    if (vars?.operatorId) {
      return {
        operatorId: vars.operatorId,
      };
    }
    return undefined;
  }, [vars]);

  const [getAircrafts, query] = usePlanesLazyQuery({
    variables,
  });

  React.useEffect(() => {
    if (authenticated && variables?.operatorId && !sameVariables(variables, query.variables)) {
      console.debug('[Context::Aircrafts] Fetching aircrafts', variables);
      getAircrafts({ variables });
    }
  }, [authenticated, getAircrafts, query?.variables, variables]);

  const { loading, fetchMore, data, called, variables: queryVariables } = query;

  const {
    operator: { operator },
  } = useOperatorContext();
  const [createAircraft] = useCreateAircraftMutation();
  const [updateAircraft] = useUpdateAircraftMutation();
  const [archiveAircraft] = useArchivePlaneMutation();

  const refetch = React.useCallback(() => {
    if (variables?.operatorId) {
      query?.refetch();
    }
  }, [query, variables]);

  const create = React.useCallback(
    async function CreateAircraft(
      attributes: CreateAircraftMutationVariables['attributes']
    ): Promise<TMutationResponse<{ aircraft: PlaneEssentialsFragment }>> {
      if (!operator) {
        return { error: 'No dropzone selected' };
      }
      const response = await createAircraft({
        variables: { attributes },
        refetchQueries: [{ query: PlanesDocument, variables: { operatorId: operator.id } }],
        update: (cache, { data: mutationData }) => {
          cache.updateQuery<PlanesQuery, PlanesQueryVariables>(
            {
              query: PlanesDocument,
              variables: { operatorId: operator.id },
              id: cache.identify(operator),
            },
            (prev) => {
              if (!prev) {
                return undefined;
              }
              if (!mutationData?.createPlane?.plane) {
                return prev;
              }

              return {
                ...prev,
                planes: [...(prev?.planes || []), mutationData.createPlane.plane],
              };
            }
          );
        },
      });

      if (response?.data?.createPlane?.plane?.id) {
        return { aircraft: response?.data?.createPlane?.plane };
      }
      return {
        error: response?.data?.createPlane?.errors?.[0],
        fieldErrors: response?.data?.createPlane?.fieldErrors || undefined,
      };
    },
    [createAircraft, operator]
  );

  const update = React.useCallback(
    async function UpdateAircraft(
      id: number,
      attributes: UpdateAircraftMutationVariables['attributes']
    ): Promise<TMutationResponse<{ aircraft: PlaneEssentialsFragment }>> {
      const response = await updateAircraft({ variables: { id, attributes } });

      if (response?.data?.updatePlane?.plane?.id) {
        return { aircraft: response?.data?.updatePlane?.plane };
      }
      return {
        error: response?.data?.updatePlane?.errors?.[0],
        fieldErrors: response?.data?.updatePlane?.fieldErrors || undefined,
      };
    },
    [updateAircraft]
  );

  const archive = React.useCallback(
    async function ArchiveAircraft(
      plane: PlaneEssentialsFragment
    ): Promise<TMutationResponse<{ aircraft: PlaneEssentialsFragment }>> {
      const response = await archiveAircraft({
        variables: { id: Number(plane.id) },
        optimisticResponse: {
          __typename: 'Mutation',
          deletePlane: {
            __typename: 'DeletePlanePayload',
            errors: null,
            fieldErrors: null,
            plane,
          },
        },
        update: (cache, { data: mutationData }) => {
          if (!mutationData?.deletePlane?.plane?.id) {
            return;
          }

          cache.evict({ id: cache.identify(mutationData.deletePlane.plane) });
        },
      });

      if (response?.data?.deletePlane?.plane?.id) {
        return { aircraft: response?.data?.deletePlane?.plane };
      }
      return {
        error: response?.data?.deletePlane?.errors?.[0],
        fieldErrors: response?.data?.deletePlane?.fieldErrors || undefined,
      };
    },
    [archiveAircraft]
  );

  return React.useMemo(
    () => ({
      loading,
      called,
      refetch: queryVariables?.operatorId ? refetch : noop,
      fetchMore: queryVariables?.operatorId ? () => fetchMore({ variables }) : uninitializedHandler,
      aircrafts: data?.planes,
      create,
      update,
      archive,
    }),
    [
      loading,
      called,
      queryVariables?.operatorId,
      refetch,
      data?.planes,
      create,
      update,
      fetchMore,
      variables,
      archive,
    ]
  );
}
