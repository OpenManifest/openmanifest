import * as React from 'react';
import { useAuthenticated } from 'app/state';
import { useAppSignal } from 'app/components/app_signal';
import sameVariables from 'app/utils/sameVariables';
import {
  useOperatorsLazyQuery,
  useOperatorsQuery,
  useUpdateVisibilityMutation,
} from '../reflection';
import { OperatorDetailedFragment, OperatorsQueryVariables } from '../operations';
import createCRUDContext, { uninitializedHandler, TMutationResponse } from './factory';
import { OperatorStateEvent } from '../schema.d';

export default function useOperators(vars: Partial<OperatorsQueryVariables>) {
  const authenticated = useAuthenticated();
  const variables: OperatorsQueryVariables = React.useMemo(
    () => ({
      state: vars?.state,
    }),
    [vars?.state]
  );

  const [getOperators, query] = useOperatorsLazyQuery();

  React.useEffect(() => {
    if (authenticated && (!sameVariables(variables, query.variables) || !query.called)) {
      getOperators({ variables });
    }
  }, [authenticated, getOperators, query.called, query.variables, variables]);

  const [updateVisibilityMutation] = useUpdateVisibilityMutation();
  const { appSignal } = useAppSignal();

  const updateVisibility = React.useCallback(
    async function UpdateVisibility(
      id: string,
      event: OperatorStateEvent
    ): Promise<TMutationResponse<{ operator: OperatorDetailedFragment }>> {
      try {
        const response = await updateVisibilityMutation({
          variables: {
            operator: id,
            event,
          },
        });

        if (response?.data?.updateVisibility?.operator?.id) {
          return { operator: response.data.updateVisibility?.operator };
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
      operators: data?.operators?.edges?.map((edge) => edge?.node),
    }),
    [called, data?.operators?.edges, fetchMore, loading, refetch, updateVisibility]
  );
}

const { Provider: OperatorsProvider, useContext: useOperatorsContext } = createCRUDContext(
  useOperators,
  {
    called: false,
    loading: false,
    operators: [],
    updateVisibility: uninitializedHandler as never,
    refetch: uninitializedHandler as never,
    fetchMore: uninitializedHandler as never,
  }
);

export { OperatorsProvider, useOperatorsContext, useOperators };
