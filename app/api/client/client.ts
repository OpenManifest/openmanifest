import { ApolloClient } from '@apollo/client';
import * as React from 'react';
import { actions, useAppDispatch, useAppSelector } from 'app/state';
import { defaultLink, useLink } from './links';
import { cache } from './cache';

const client = new ApolloClient({
  link: defaultLink,
  cache,
});

export default function useApolloClient() {
  const link = useLink();
  const dispatch = useAppDispatch();
  const { credentials, authenticated } = useAppSelector((root) => root?.global);

  React.useEffect(() => {
    console.debug('[Apollo::Link]: Replacing Apollo Client Link');
    // abortController.abort();
    const isAuthenticated = !!credentials?.accessToken;
    const authStateChanged = isAuthenticated !== authenticated;
    if (authStateChanged) {
      console.debug('[Apollo::Link]: Authentication state changed to ', isAuthenticated);
      dispatch(actions.global.setAuthenticated(!!credentials?.accessToken));
    }
    console.debug('[Apollo::Link]: Replacing Apollo Client Link');
    client.setLink(link);

    if (authStateChanged) {
      console.debug('[Apollo::Link]: Refetching queries after authentication state change');
      // client.reFetchObservableQueries();
    }
  }, [authenticated, credentials?.accessToken, dispatch, link]);

  return client;
}
