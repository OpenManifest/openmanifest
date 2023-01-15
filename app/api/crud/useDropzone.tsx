import * as React from 'react';
import { isEqual, noop } from 'lodash';
import { useAppSelector } from 'app/state';
import { useCurrentUserPermissionsLazyQuery, useDropzoneLazyQuery } from '../reflection';
import { CurrentUserPermissionsQueryVariables, DropzoneQueryVariables } from '../operations';
import { uninitializedHandler } from './factory';

export function useDropzone(vars: Partial<DropzoneQueryVariables>) {
  const { authenticated } = useAppSelector((root) => root.global);
  const variables: DropzoneQueryVariables | undefined = React.useMemo(() => {
    if (vars?.dropzoneId) {
      return {
        dropzoneId: vars.dropzoneId,
      };
    }
    return undefined;
  }, [vars]);

  const [getDropzone, query] = useDropzoneLazyQuery();
  const permissionsVariables = React.useMemo(
    () => ({ dropzoneId: variables?.dropzoneId }),
    [variables?.dropzoneId]
  );

  const [getPermissions, permissions] = useCurrentUserPermissionsLazyQuery();

  React.useEffect(() => {
    if (authenticated && variables?.dropzoneId && !isEqual(variables, query.variables)) {
      console.debug('[Context::Dropzone] Fetching dropzone', variables);
      getDropzone({ variables });
    }
  }, [authenticated, getDropzone, query.variables, variables]);

  React.useEffect(() => {
    if (
      authenticated &&
      permissionsVariables?.dropzoneId &&
      !isEqual(permissionsVariables, permissions.variables)
    ) {
      console.debug('[Context::Dropzone] Fetching user permissions', permissionsVariables);
      getPermissions({ variables: permissionsVariables as CurrentUserPermissionsQueryVariables });
    }
  }, [
    authenticated,
    getDropzone,
    getPermissions,
    permissions.variables,
    permissionsVariables,
    query.variables,
    variables,
  ]);

  const { loading, fetchMore, data, called, variables: queryVariables } = query;

  const refetch = React.useCallback(() => {
    if (variables?.dropzoneId) {
      query?.refetch();
    }
  }, [query, variables]);

  return React.useMemo(
    () => ({
      loading,
      called,
      permissions: permissions?.data?.dropzone?.currentUser?.permissions || [],
      refetch: queryVariables?.dropzoneId ? refetch : noop,
      fetchMore: queryVariables?.dropzoneId ? () => fetchMore({ variables }) : uninitializedHandler,
      dropzone: data?.dropzone,
      currentUser: data?.dropzone?.currentUser,
    }),
    [
      variables,
      loading,
      called,
      permissions?.data?.dropzone?.currentUser?.permissions,
      refetch,
      queryVariables?.dropzoneId,
      fetchMore,
      data?.dropzone,
    ]
  );
}
