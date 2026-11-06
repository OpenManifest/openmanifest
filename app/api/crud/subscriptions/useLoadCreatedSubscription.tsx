import { OnDataOptions } from '@apollo/client';
import { LoadCreatedSubscription, LoadsQuery, LoadsQueryVariables } from 'app/api/operations';
import { useLoadCreatedSubscription, LoadsDocument } from 'app/api/reflection';
import { dateInZone } from 'app/utils/operatorTime';
import uniqBy from 'lodash/uniqBy';
import * as React from 'react';

export function useLoadCreated(variables: Partial<LoadsQueryVariables>, timeZone?: string) {
  const onData = React.useCallback(
    ({ client, data: { data: result } }: OnDataOptions<LoadCreatedSubscription>) => {
      if (result?.loadCreated?.load?.id) {
        const { load } = result.loadCreated;
        client.cache.updateQuery<LoadsQuery>(
          {
            query: LoadsDocument,
            broadcast: true,
            variables: {
              ...variables,
              // The board of the day the load was created on at the operator
              date: dateInZone(load.createdAt, timeZone),
            },
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
              ),
            },
          })
        );
      } else {
      }
    },
    [variables, timeZone]
  );

  return useLoadCreatedSubscription({
    skip: !variables?.operator,
    shouldResubscribe: true,
    variables: {
      operatorId: variables?.operator as string,
    },
    onData,
  });
}
