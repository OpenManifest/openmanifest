import * as React from 'react';
import { useAppSelector } from 'app/state';
import { useDropzonesQuery } from '../reflection';
import { DropzonesQueryVariables } from '../operations';
import createCRUDContext, { uninitializedHandler } from './factory';

export default function useDropzones(vars: Partial<DropzonesQueryVariables>) {
  const state = useAppSelector((root) => root.global);
  const variables: DropzonesQueryVariables = React.useMemo(
    () => ({
      state: vars?.state,
    }),
    [vars?.state]
  );

  const query = useDropzonesQuery({
    initialFetchPolicy: 'cache-first',
    variables,
    skip: !state?.credentials?.accessToken,
  });

  const { loading, fetchMore, refetch, data, called } = query;
  return React.useMemo(
    () => ({
      loading,
      called,
      refetch,
      fetchMore,
      dropzones: data?.dropzones?.edges?.map((edge) => edge?.node),
    }),
    [called, data?.dropzones?.edges, fetchMore, loading, refetch]
  );
}

const { Provider: DropzonesProvider, useContext: useDropzonesContext } = createCRUDContext(
  useDropzones,
  {
    called: false,
    loading: false,
    dropzones: [],
    refetch: uninitializedHandler as never,
    fetchMore: uninitializedHandler as never,
  }
);

export { DropzonesProvider, useDropzonesContext, useDropzones };
