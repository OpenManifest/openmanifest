import { OnDataOptions } from '@apollo/client';
import { DropzoneUserDetailsFragment, UserUpdatedSubscription } from 'app/api/operations';
import { DropzoneUserDetailsFragmentDoc, useUserUpdatedSubscription } from 'app/api/reflection';
import * as React from 'react';

export function useUserUpdated(dropzoneUserId?: string) {
  const onData = React.useCallback(
    ({ client, data: { data: result } }: OnDataOptions<UserUpdatedSubscription>) => {
      if (result?.userUpdated?.dropzoneUser) {
        console.debug('[Apollo::Subscription::UpdateUser]: Received update', result?.userUpdated);
        const { dropzoneUser } = result.userUpdated;
        client.cache.updateFragment<DropzoneUserDetailsFragment>(
          {
            fragment: DropzoneUserDetailsFragmentDoc,
            fragmentName: 'dropzoneUserDetails',
            broadcast: true,
            id: client.cache.identify(dropzoneUser),
          },
          (previous) => ({
            ...previous,
            ...dropzoneUser,
          })
        );
      }
    },
    []
  );

  return useUserUpdatedSubscription({
    variables: { id: dropzoneUserId as string },
    skip: !dropzoneUserId,
    onData,
  });
}
