import * as React from 'react';
import { useAppSelector } from 'app/state';
import { useAppSignal } from 'app/components/app_signal';
import { isEqual } from 'lodash';
import {
  useDropzonesLazyQuery,
  useDropzonesQuery,
  useUpdateVisibilityMutation,
} from '../reflection';
import { DropzoneDetailedFragment, DropzonesQueryVariables } from '../operations';
import createCRUDContext, { uninitializedHandler, TMutationResponse } from './factory';
import { DropzoneStateEvent } from '../schema.d';

export default function useDropzones(vars: Partial<DropzonesQueryVariables>) {
  const state = useAppSelector((root) => root.global);
  const { authenticated } = state;
  const variables: DropzonesQueryVariables = React.useMemo(
    () => ({
      state: vars?.state,
    }),
    [vars?.state]
  );

  const [getDropzones, query] = useDropzonesLazyQuery();

  React.useEffect(() => {
    if (authenticated && (!isEqual(variables, query.variables) || !query.called)) {
      console.debug('[Context::Dropzones] Fetching dropzones', variables);
      getDropzones({ variables });
    }
  }, [authenticated, getDropzones, query.called, query.variables, variables]);

  const [updateVisibilityMutation] = useUpdateVisibilityMutation();
  const { appSignal } = useAppSignal();

  const updateVisibility = React.useCallback(
    async function UpdateVisibility(
      id: string,
      event: DropzoneStateEvent
    ): Promise<TMutationResponse<{ dropzone: DropzoneDetailedFragment }>> {
      try {
        const response = await updateVisibilityMutation({
          variables: {
            dropzone: id,
            event,
          },
        });

        if (response?.data?.updateVisibility?.dropzone?.id) {
          return { dropzone: response.data.updateVisibility?.dropzone };
        }
        return {
          error: response?.data?.updateVisibility?.errors?.[0],
          fieldErrors: response?.data?.updateVisibility?.fieldErrors || undefined,
        };
      } catch (e) {
        appSignal.sendError(e as Error);
        return { error: 'You cant modify dropzone visibility' };
      }
    },
    [appSignal, updateVisibilityMutation]
  );

  const { loading, fetchMore, refetch, data, called } = query;
  return React.useMemo(
    () => ({
      loading,
      called,
      refetch,
      fetchMore,
      updateVisibility,
      dropzones: data?.dropzones?.edges?.map((edge) => edge?.node),
    }),
    [called, data?.dropzones?.edges, fetchMore, loading, refetch, updateVisibility]
  );
}

const { Provider: DropzonesProvider, useContext: useDropzonesContext } = createCRUDContext(
  useDropzones,
  {
    called: false,
    loading: false,
    dropzones: [],
    updateVisibility: uninitializedHandler as never,
    refetch: uninitializedHandler as never,
    fetchMore: uninitializedHandler as never,
  }
);

export { DropzonesProvider, useDropzonesContext, useDropzones };
