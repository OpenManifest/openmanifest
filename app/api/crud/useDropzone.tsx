import * as React from 'react';
import { isEqual } from 'lodash';
import { startOfDay } from 'date-fns';
import { useCurrentUserPermissionsLazyQuery, useQueryDropzoneLazyQuery } from '../reflection';
import { QueryDropzoneQueryVariables } from '../operations';
import createCRUDContext, { uninitializedHandler } from './factory';

export default function useDropzone(vars: Partial<QueryDropzoneQueryVariables>) {
  const [getDropzone, query] = useQueryDropzoneLazyQuery();
  const firstLoadTimestamp = startOfDay(new Date()).toISOString();
  const variables = React.useMemo(
    () => ({ ...vars, earliestTimestamp: firstLoadTimestamp }),
    [firstLoadTimestamp, vars]
  );

  const [getPermissions, permissions] = useCurrentUserPermissionsLazyQuery({
    variables: {
      dropzoneId: Number(variables?.dropzoneId),
    },
  });

  React.useEffect(() => {
    if (variables?.dropzoneId && !query?.loading && !isEqual(query.variables, variables)) {
      getDropzone({ variables: variables as QueryDropzoneQueryVariables });
      getPermissions();
      console.debug('Refetching because of diff in ', query.variables, variables);
    }
  }, [getDropzone, getPermissions, query?.loading, query.variables, variables]);

  return {
    loading: query?.loading,
    called: query?.called,
    permissions: permissions?.data?.dropzone?.currentUser?.permissions || [],
    refetch: query?.refetch,
    fetchMore: query?.fetchMore,
    dropzone: query?.data?.dropzone,
    currentUser: query?.data?.dropzone?.currentUser,
  };
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
