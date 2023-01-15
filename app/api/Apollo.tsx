import { ApolloProvider } from '@apollo/client/react';
import * as React from 'react';
import useApolloClient from './client/client';

export default function Apollo({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
