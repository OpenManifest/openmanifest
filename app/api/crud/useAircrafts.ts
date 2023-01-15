import * as React from 'react';
import { isEqual, noop } from 'lodash';
import { useDropzoneContext } from 'app/providers/dropzone/context';
import { useAppSelector } from 'app/state';
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
  DropzoneQueryVariables,
  PlaneEssentialsFragment,
  PlanesQueryVariables,
  UpdateAircraftMutationVariables,
} from '../operations';
import { TMutationResponse, uninitializedHandler } from './factory';

export function useAircrafts(vars?: Partial<PlanesQueryVariables>) {
  const { authenticated } = useAppSelector((root) => root.global);
  const variables: DropzoneQueryVariables | undefined = React.useMemo(() => {
    if (vars?.dropzoneId) {
      return {
        dropzoneId: vars.dropzoneId,
      };
    }
    return undefined;
  }, [vars]);

  const [getAircrafts, query] = usePlanesLazyQuery({
    variables,
  });

  React.useEffect(() => {
    if (authenticated && variables?.dropzoneId && !isEqual(variables, query.variables)) {
      console.debug('[Context::Aircrafts] Fetching aircrafts', variables);
      getAircrafts({ variables });
    }
  }, [authenticated, getAircrafts, query?.variables, variables]);

  const { loading, fetchMore, data, called, variables: queryVariables } = query;

  const {
    dropzone: { dropzone },
  } = useDropzoneContext();
  const [createAircraft] = useCreateAircraftMutation();
  const [updateAircraft] = useUpdateAircraftMutation();
  const [archiveAircraft] = useArchivePlaneMutation();

  const refetch = React.useCallback(() => {
    if (variables?.dropzoneId) {
      query?.refetch();
    }
  }, [query, variables]);

  const create = React.useCallback(
    async function CreateAircraft(
      attributes: CreateAircraftMutationVariables['attributes']
    ): Promise<TMutationResponse<{ aircraft: PlaneEssentialsFragment }>> {
      if (!dropzone) {
        return { error: 'No dropzone selected' };
      }
      const response = await createAircraft({
        variables: { attributes },
        refetchQueries: [{ query: PlanesDocument, variables: { dropzoneId: dropzone.id } }],
        update: (cache, { data: mutationData }) => {
          cache.updateQuery<PlanesQuery, PlanesQueryVariables>(
            {
              query: PlanesDocument,
              variables: { dropzoneId: dropzone.id },
              id: cache.identify(dropzone),
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
    [createAircraft, dropzone]
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
      refetch: queryVariables?.dropzoneId ? refetch : noop,
      fetchMore: queryVariables?.dropzoneId ? () => fetchMore({ variables }) : uninitializedHandler,
      aircrafts: data?.planes,
      create,
      update,
      archive,
    }),
    [
      loading,
      called,
      queryVariables?.dropzoneId,
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
