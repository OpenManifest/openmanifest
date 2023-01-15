import { ApolloLink } from '@apollo/client';
import React from 'react';
import { useAuthenticationLink } from './authentication';
import { useErrorLink, defaultErrorLink } from './errors';
import { httpWithWsLink, httpLink } from './http';
import { useAppSignalLink } from './appSignal';

export const defaultLink = ApolloLink.from([defaultErrorLink, httpLink]);
export function useLink() {
  const authLink = useAuthenticationLink();
  const errorLink = useErrorLink();
  const appSignalLink = useAppSignalLink();

  const links = React.useMemo(
    () => [appSignalLink, errorLink, authLink, httpWithWsLink].filter(Boolean) as ApolloLink[],
    [appSignalLink, authLink, errorLink]
  );
  return React.useMemo(() => ApolloLink.from(links), [links]);
}
