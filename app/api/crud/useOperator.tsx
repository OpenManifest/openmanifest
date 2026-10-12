import * as React from 'react';
import { noop } from 'lodash';
import sameVariables from 'app/utils/sameVariables';
import { useAuthenticated, useSession } from 'app/state';
import {
  useCurrentUserPermissionsLazyQuery,
  useOperatorLazyQuery,
  useUpdateOperatorMutation,
} from '../reflection';
import {
  CurrentUserPermissionsQueryVariables,
  OperatorEssentialsFragment,
  OperatorQueryVariables,
} from '../operations';
import { TMutationResponse, uninitializedHandler } from './factory';
import { OperatorInput } from '../schema';

export function useOperator(vars: Partial<OperatorQueryVariables>) {
  const authenticated = useAuthenticated();
  const currentOperatorId = useSession((session) => session.currentOperatorId);
  const variables: OperatorQueryVariables | undefined = React.useMemo(() => {
    if (vars?.operatorId) {
      return {
        operatorId: vars.operatorId,
      };
    }
    return undefined;
  }, [vars]);

  const [getOperator, query] = useOperatorLazyQuery();
  const [updateOperator] = useUpdateOperatorMutation();
  const permissionsVariables = React.useMemo(
    () => ({ operatorId: variables?.operatorId }),
    [variables?.operatorId]
  );

  const [getPermissions, permissions] = useCurrentUserPermissionsLazyQuery();

  const update = React.useCallback(
    async (
      attributes: OperatorInput
    ): Promise<TMutationResponse<{ operator: OperatorEssentialsFragment }>> => {
      try {
        if (!query?.data?.operator?.id && !currentOperatorId)
          return { error: 'No dropzone selected' };
        const { data: response } = await updateOperator({
          variables: {
            id: Number(query?.data?.operator?.id || currentOperatorId),
            attributes,
          },
        });

        if (response?.updateOperator?.operator) {
          return { operator: response?.updateOperator?.operator };
        }
        return {
          error: response?.updateOperator?.errors?.[0],
          fieldErrors: response?.updateOperator?.fieldErrors || undefined,
        };
      } catch (err) {
        if (err instanceof Error) {
          return { error: err.message };
        }
        return { error: 'Something went wrong' };
      }
    },
    [currentOperatorId, query?.data?.operator?.id, updateOperator]
  );
  React.useEffect(() => {
    if (authenticated && variables?.operatorId && !sameVariables(variables, query.variables)) {
      console.debug('[Context::Dropzone] Fetching dropzone', variables);
      getOperator({ variables });
    }
  }, [authenticated, getOperator, query.variables, variables]);

  React.useEffect(() => {
    if (
      authenticated &&
      permissionsVariables?.operatorId &&
      !sameVariables(permissionsVariables, permissions.variables)
    ) {
      console.debug('[Context::Dropzone] Fetching user permissions', permissionsVariables);
      getPermissions({ variables: permissionsVariables as CurrentUserPermissionsQueryVariables });
    }
  }, [
    authenticated,
    getOperator,
    getPermissions,
    permissions.variables,
    permissionsVariables,
    query.variables,
    variables,
  ]);

  const { loading, fetchMore, data, called, variables: queryVariables } = query;

  const refetch = React.useCallback(() => {
    if (variables?.operatorId) {
      query?.refetch();
    }
  }, [query, variables]);

  return React.useMemo(
    () => ({
      loading,
      called,
      permissions: permissions?.data?.operator?.currentUser?.permissions || [],
      update,
      refetch: queryVariables?.operatorId ? refetch : noop,
      fetchMore: queryVariables?.operatorId ? () => fetchMore({ variables }) : uninitializedHandler,
      operator: data?.operator,
      currentUser: data?.operator?.currentUser,
    }),
    [
      variables,
      loading,
      called,
      update,
      permissions?.data?.operator?.currentUser?.permissions,
      refetch,
      queryVariables?.operatorId,
      fetchMore,
      data?.operator,
    ]
  );
}
