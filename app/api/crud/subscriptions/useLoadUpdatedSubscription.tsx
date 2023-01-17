import { OnDataOptions } from '@apollo/client';
import { LoadDetailsFragment, LoadQuery, LoadUpdatedSubscription } from 'app/api/operations';
import {
  LoadDetailsFragmentDoc,
  LoadDocument,
  useLoadUpdatedSubscription,
} from 'app/api/reflection';
import * as React from 'react';

export function useLoadUpdated(loadId?: string) {
  const onData = React.useCallback(
    ({ client, data: { data: result } }: OnDataOptions<LoadUpdatedSubscription>) => {
      if (result?.loadUpdated?.load?.id) {
        const { load } = result.loadUpdated;
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

        console.debug('[Subscription::LoadUpdated] Updated load fragment for', load);
      } else {
        console.debug(
          '[Subscription::LoadUpdated] Received subscription data without load id',
          result
        );
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
