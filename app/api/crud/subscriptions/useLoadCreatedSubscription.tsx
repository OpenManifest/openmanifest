import { OnDataOptions } from '@apollo/client';
import { LoadCreatedSubscription, LoadsQuery, LoadsQueryVariables } from 'app/api/operations';
import { useLoadCreatedSubscription, LoadsDocument } from 'app/api/reflection';
import { DateTime } from 'luxon';
import uniqBy from 'lodash/uniqBy';
import * as React from 'react';

export function useLoadCreated(variables: Partial<LoadsQueryVariables>) {
  const onData = React.useCallback(
    ({ client, data: { data: result } }: OnDataOptions<LoadCreatedSubscription>) => {
      if (result?.loadCreated?.load?.id) {
        const { load } = result.loadCreated;
        console.debug('[Subscription::LoadCreated] Adding new load to the board...', variables, load);
        client.cache.updateQuery<LoadsQuery>(
          {
            query: LoadsDocument,
            broadcast: true,
            variables: {
              ...variables,
              date: DateTime.fromISO(load.createdAt).toISODate()
            }
          },
          (previous) => ({
            ...previous,
            loads: {
              ...(previous?.loads || {}),
              edges: uniqBy(
                previous?.loads?.edges?.some((existing) => existing?.node?.id === load?.id)
                  ? previous?.loads?.edges
                  : [{ node: load, __typename: 'LoadEdge' }, ...(previous?.loads?.edges || [])],
                (edge) => edge?.node?.id
              )
            }
          })
        );

        console.debug('[Subscription::LoadCreated] Added new load to the board', load);
      } else {
        console.debug('[Subscription::LoadCreated] Received subscription data without load id', result);
      }
    },
    [variables]
  );

  return useLoadCreatedSubscription({
    skip: !variables?.dropzone,
    shouldResubscribe: true,
    variables: {
      dropzoneId: variables?.dropzone as string
    },
    onData
  });
}
