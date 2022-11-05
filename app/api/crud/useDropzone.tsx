import * as React from 'react';
import { noop } from 'lodash';
import { useCurrentUserPermissionsQuery, useDropzoneQuery } from '../reflection';
import { CurrentUserPermissionsQueryVariables, DropzoneQueryVariables } from '../operations';
import createCRUDContext, { uninitializedHandler } from './factory';

export default function useDropzone(vars: Partial<DropzoneQueryVariables>) {
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

  const { loading, fetchMore, data, called, variables: queryVariables } = query;
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

const { Provider: DropzoneProvider, useContext: useDropzoneContext } = createCRUDContext(
  useDropzone,
  {
    permissions: [],
    called: false,
    loading: false,
    dropzone: null,
    currentUser: undefined,
    refetch: uninitializedHandler as never,
    fetchMore: uninitializedHandler as never,
  }
);

export { DropzoneProvider, useDropzoneContext, useDropzone };
