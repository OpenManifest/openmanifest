import { OnDataOptions } from '@apollo/client';
import { MembershipDetailsFragment, UserUpdatedSubscription } from 'app/api/operations';
import { MembershipDetailsFragmentDoc, useUserUpdatedSubscription } from 'app/api/reflection';
import * as React from 'react';

export function useUserUpdated(membershipId?: string) {
  const onData = React.useCallback(
    ({ client, data: { data: result } }: OnDataOptions<UserUpdatedSubscription>) => {
      if (result?.userUpdated?.membership) {
        console.debug('[Apollo::Subscription::UpdateUser]: Received update', result?.userUpdated);
        const { membership } = result.userUpdated;
        client.cache.updateFragment<MembershipDetailsFragment>(
          {
            fragment: MembershipDetailsFragmentDoc,
            fragmentName: 'membershipDetails',
            broadcast: true,
            id: client.cache.identify(membership),
          },
          (previous) => ({
            ...previous,
            ...membership,
          })
        );
      }
    },
    []
  );

  return useUserUpdatedSubscription({
    variables: { id: membershipId as string },
    skip: !membershipId,
    onData,
  });
}
