import { ApolloClient } from '@apollo/client';
import * as React from 'react';
import { setApolloClient } from './registry';
import { defaultLink, useLink } from './links';
import { cache } from './cache';

const client = new ApolloClient({
  link: defaultLink,
  cache,
});
setApolloClient(client);

export default function useApolloClient() {
  const link = useLink();

  // Install the link while rendering, not in an effect: effects of the children run before this component's, so queries
  // started by the first render after a reload would otherwise go out through the unauthenticated default link.
  React.useMemo(() => {
    console.debug('[Apollo::Link]: Replacing Apollo Client Link');
    client.setLink(link);
  }, [link]);

  return client;
}
