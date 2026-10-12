import * as React from 'react';
import { noop } from 'lodash';
import sameVariables from 'app/utils/sameVariables';
import { useOperatorContext } from 'app/providers/operator/context';
import { useAuthenticated } from 'app/state';
import {
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  VehiclesDocument,
  useArchiveVehicleMutation,
  useVehiclesLazyQuery,
} from '../reflection';
import {
  CreateVehicleMutationVariables,
  VehiclesQuery,
  OperatorQueryVariables,
  VehicleEssentialsFragment,
  VehiclesQueryVariables,
  UpdateVehicleMutationVariables,
} from '../operations';
import { TMutationResponse, uninitializedHandler } from './factory';

export function useVehicles(vars?: Partial<VehiclesQueryVariables>) {
  const authenticated = useAuthenticated();
  const variables: OperatorQueryVariables | undefined = React.useMemo(() => {
    if (vars?.operatorId) {
      return {
        operatorId: vars.operatorId,
      };
    }
    return undefined;
  }, [vars]);

  const [getVehicles, query] = useVehiclesLazyQuery({
    variables,
  });

  React.useEffect(() => {
    if (authenticated && variables?.operatorId && !sameVariables(variables, query.variables)) {
      console.debug('[Context::Aircrafts] Fetching aircrafts', variables);
      getVehicles({ variables });
    }
  }, [authenticated, getVehicles, query?.variables, variables]);

  const { loading, fetchMore, data, called, variables: queryVariables } = query;

  const {
    operator: { operator },
  } = useOperatorContext();
  const [createVehicle] = useCreateVehicleMutation();
  const [updateVehicle] = useUpdateVehicleMutation();
  const [archiveVehicle] = useArchiveVehicleMutation();

  const refetch = React.useCallback(() => {
    if (variables?.operatorId) {
      query?.refetch();
    }
  }, [query, variables]);

  const create = React.useCallback(
    async function CreateVehicle(
      attributes: CreateVehicleMutationVariables['attributes']
    ): Promise<TMutationResponse<{ vehicle: VehicleEssentialsFragment }>> {
      if (!operator) {
        return { error: 'No dropzone selected' };
      }
      const response = await createVehicle({
        variables: { attributes },
        refetchQueries: [{ query: VehiclesDocument, variables: { operatorId: operator.id } }],
        update: (cache, { data: mutationData }) => {
          cache.updateQuery<VehiclesQuery, VehiclesQueryVariables>(
            {
              query: VehiclesDocument,
              variables: { operatorId: operator.id },
              id: cache.identify(operator),
            },
            (prev) => {
              if (!prev) {
                return undefined;
              }
              if (!mutationData?.createVehicle?.vehicle) {
                return prev;
              }

              return {
                ...prev,
                vehicles: [...(prev?.vehicles || []), mutationData.createVehicle.vehicle],
              };
            }
          );
        },
      });

      if (response?.data?.createVehicle?.vehicle?.id) {
        return { vehicle: response?.data?.createVehicle?.vehicle };
      }
      return {
        error: response?.data?.createVehicle?.errors?.[0],
        fieldErrors: response?.data?.createVehicle?.fieldErrors || undefined,
      };
    },
    [createVehicle, operator]
  );

  const update = React.useCallback(
    async function UpdateVehicle(
      id: number,
      attributes: UpdateVehicleMutationVariables['attributes']
    ): Promise<TMutationResponse<{ vehicle: VehicleEssentialsFragment }>> {
      const response = await updateVehicle({ variables: { id, attributes } });

      if (response?.data?.updateVehicle?.vehicle?.id) {
        return { vehicle: response?.data?.updateVehicle?.vehicle };
      }
      return {
        error: response?.data?.updateVehicle?.errors?.[0],
        fieldErrors: response?.data?.updateVehicle?.fieldErrors || undefined,
      };
    },
    [updateVehicle]
  );

  const archive = React.useCallback(
    async function ArchiveVehicle(
      vehicle: VehicleEssentialsFragment
    ): Promise<TMutationResponse<{ vehicle: VehicleEssentialsFragment }>> {
      const response = await archiveVehicle({
        variables: { id: Number(vehicle.id) },
        optimisticResponse: {
          __typename: 'Mutation',
          deleteVehicle: {
            __typename: 'DeleteVehiclePayload',
            errors: null,
            fieldErrors: null,
            vehicle,
          },
        },
        update: (cache, { data: mutationData }) => {
          if (!mutationData?.deleteVehicle?.vehicle?.id) {
            return;
          }

          cache.evict({ id: cache.identify(mutationData.deleteVehicle.vehicle) });
        },
      });

      if (response?.data?.deleteVehicle?.vehicle?.id) {
        return { vehicle: response?.data?.deleteVehicle?.vehicle };
      }
      return {
        error: response?.data?.deleteVehicle?.errors?.[0],
        fieldErrors: response?.data?.deleteVehicle?.fieldErrors || undefined,
      };
    },
    [archiveVehicle]
  );

  return React.useMemo(
    () => ({
      loading,
      called,
      refetch: queryVariables?.operatorId ? refetch : noop,
      fetchMore: queryVariables?.operatorId ? () => fetchMore({ variables }) : uninitializedHandler,
      vehicles: data?.vehicles,
      create,
      update,
      archive,
    }),
    [
      loading,
      called,
      queryVariables?.operatorId,
      refetch,
      data?.vehicles,
      create,
      update,
      fetchMore,
      variables,
      archive,
    ]
  );
}
