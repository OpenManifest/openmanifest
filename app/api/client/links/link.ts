import { ApolloLink } from '@apollo/client';
import React from 'react';
import { useAuthenticationLink } from './authentication';
import { useErrorLink, defaultErrorLink } from './errors';
import { createHttpLink, httpLink } from './http';
import { useAppSignalLink } from './appSignal';

export const defaultLink = ApolloLink.from([defaultErrorLink, httpLink]);
export function useLink() {
  const authLink = useAuthenticationLink();
  const errorLink = useErrorLink();
  const appSignalLink = useAppSignalLink();
  const httpWebsocketsLink = React.useMemo(() => createHttpLink(), []);

  const links = React.useMemo(
    () => [authLink, errorLink, appSignalLink, httpWebsocketsLink].filter(Boolean) as ApolloLink[],
    [appSignalLink, authLink, errorLink, httpWebsocketsLink]
  );
  return React.useMemo(() => ApolloLink.from(links), [links]);
}
