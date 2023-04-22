import * as React from 'react';
import { isEqual, noop } from 'lodash';
import { useAppSelector } from 'app/state';
import { useCurrentUserPermissionsLazyQuery, useDropzoneLazyQuery, useUpdateDropzoneMutation } from '../reflection';
import {
  CurrentUserPermissionsQueryVariables,
  DropzoneEssentialsFragment,
  DropzoneQueryVariables
} from '../operations';
import { TMutationResponse, uninitializedHandler } from './factory';
import { DropzoneInput } from '../schema';

export function useDropzone(vars: Partial<DropzoneQueryVariables>) {
  const { authenticated, currentDropzoneId } = useAppSelector((root) => root.global);
  const variables: DropzoneQueryVariables | undefined = React.useMemo(() => {
    if (vars?.dropzoneId) {
      return {
        dropzoneId: vars.dropzoneId
      };
    }
    return undefined;
  }, [vars]);

  const [getDropzone, query] = useDropzoneLazyQuery();
  const [updateDropzone] = useUpdateDropzoneMutation();
  const permissionsVariables = React.useMemo(() => ({ dropzoneId: variables?.dropzoneId }), [variables?.dropzoneId]);

  const [getPermissions, permissions] = useCurrentUserPermissionsLazyQuery();

  const update = React.useCallback(
    async (attributes: DropzoneInput): Promise<TMutationResponse<{ dropzone: DropzoneEssentialsFragment }>> => {
      try {
        if (!query?.data?.dropzone?.id && !currentDropzoneId) return { error: 'No dropzone selected' };
        const { data: response } = await updateDropzone({
          variables: {
            id: Number(query?.data?.dropzone?.id || currentDropzoneId),
            attributes
          }
        });

        if (response?.updateDropzone?.dropzone) {
          return { dropzone: response?.updateDropzone?.dropzone };
        }
        return {
          error: response?.updateDropzone?.errors?.[0],
          fieldErrors: response?.updateDropzone?.fieldErrors || undefined
        };
      } catch (err) {
        if (err instanceof Error) {
          return { error: err.message };
        }
        return { error: 'Something went wrong' };
      }
    },
    [currentDropzoneId, query?.data?.dropzone?.id, updateDropzone]
  );
  React.useEffect(() => {
    if (authenticated && variables?.dropzoneId && !isEqual(variables, query.variables)) {
      console.debug('[Context::Dropzone] Fetching dropzone', variables);
      getDropzone({ variables });
    }
  }, [authenticated, getDropzone, query.variables, variables]);

  React.useEffect(() => {
    if (authenticated && permissionsVariables?.dropzoneId && !isEqual(permissionsVariables, permissions.variables)) {
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
    variables
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
      update,
      refetch: queryVariables?.dropzoneId ? refetch : noop,
      fetchMore: queryVariables?.dropzoneId ? () => fetchMore({ variables }) : uninitializedHandler,
      dropzone: data?.dropzone,
      currentUser: data?.dropzone?.currentUser
    }),
    [
      variables,
      loading,
      called,
      update,
      permissions?.data?.dropzone?.currentUser?.permissions,
      refetch,
      queryVariables?.dropzoneId,
      fetchMore,
      data?.dropzone
    ]
  );
}
