import { ApolloClient } from '@apollo/client';
import * as React from 'react';
import { actions, useAppDispatch, useAppSelector, useSession } from 'app/state';
import { defaultLink, useLink } from './links';
import { cache } from './cache';

const client = new ApolloClient({
  link: defaultLink,
  cache,
});

export default function useApolloClient() {
  const link = useLink();
  const dispatch = useAppDispatch();
  const { authenticated } = useAppSelector((root) => root?.global);
  const credentials = useSession((session) => session.credentials);

  // Install the link while rendering, not in an effect: effects of the children run before this component's, so queries
  // started by the first render after a reload would otherwise go out through the unauthenticated default link.
  React.useMemo(() => {
    console.debug('[Apollo::Link]: Replacing Apollo Client Link');
    client.setLink(link);
  }, [link]);

  React.useEffect(() => {
    // abortController.abort();
    const isAuthenticated = !!credentials?.accessToken;
    const authStateChanged = isAuthenticated !== authenticated;
    if (authStateChanged) {
      console.debug('[Apollo::Link]: Authentication state changed to ', isAuthenticated);
      dispatch(actions.global.setAuthenticated(!!credentials?.accessToken));
    }

    if (authStateChanged) {
      console.debug('[Apollo::Link]: Refetching queries after authentication state change');
      // client.reFetchObservableQueries();
    }
  }, [authenticated, credentials?.accessToken, dispatch]);

  return client;
}
