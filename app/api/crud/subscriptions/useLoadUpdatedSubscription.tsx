import { ApolloClient, OnDataOptions } from '@apollo/client';
import { LoadDetailsFragment, LoadQuery, LoadUpdatedSubscription } from 'app/api/operations';
import {
  LoadDetailsFragmentDoc,
  LoadDocument,
  useLoadUpdatedSubscription,
} from 'app/api/reflection';
import * as React from 'react';

/** Writes a pushed load into the cache: its fragment and the query of the load screen */
export function applyLoadUpdate(client: ApolloClient<unknown>, load: LoadDetailsFragment) {
  client.cache.updateFragment<LoadDetailsFragment>(
    {
      fragment: LoadDetailsFragmentDoc,
      fragmentName: 'loadDetails',
      broadcast: true,
      id: client.cache.identify(load),
    },
    () => load
  );

  client.cache.updateQuery<LoadQuery>(
    {
      query: LoadDocument,
      broadcast: true,
      variables: { id: load.id },
    },
    (previous) => ({
      ...previous,
      load: {
        __typename: 'Load',
        ...load,
      },
    })
  );
}

export function useLoadUpdated(loadId?: string) {
  const onData = React.useCallback(
    ({ client, data: { data: result } }: OnDataOptions<LoadUpdatedSubscription>) => {
      if (result?.loadUpdated?.load?.id) {
        applyLoadUpdate(client, result.loadUpdated.load);
      }
    },
    []
  );

  return useLoadUpdatedSubscription({
    skip: !loadId,
    variables: {
      id: loadId as string,
    },
    onData,
  });
}
