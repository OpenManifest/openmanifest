import * as React from 'react';
import { noop } from 'lodash';
import { useCurrentUserPermissionsQuery, useDropzoneQuery } from '../reflection';
import { CurrentUserPermissionsQueryVariables, DropzoneQueryVariables } from '../operations';
import { uninitializedHandler } from './factory';

export function useDropzone(vars: Partial<DropzoneQueryVariables>) {
  const variables: DropzoneQueryVariables | undefined = React.useMemo(() => {
    if (vars?.dropzoneId) {
      return {
        dropzoneId: vars.dropzoneId,
      };
    }
    return undefined;
  }, [vars]);

  const query = useDropzoneQuery({
    initialFetchPolicy: 'cache-first',
    variables,
    skip: !variables?.dropzoneId,
  });

  const { loading, fetchMore, data, called, variables: queryVariables } = query;

  const permissionsVariables = React.useMemo(
    () => ({ dropzoneId: variables?.dropzoneId }),
    [variables?.dropzoneId]
  );

  const permissions = useCurrentUserPermissionsQuery({
    variables: permissionsVariables as CurrentUserPermissionsQueryVariables,
    skip: !permissionsVariables?.dropzoneId,
  });

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
