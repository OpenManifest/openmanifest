import { ApolloClient, createHttpLink, InMemoryCache, ServerError } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

import { setContext } from '@apollo/client/link/context';
import { onError } from "@apollo/client/link/error";
import React, { useCallback, useMemo } from 'react';
import { globalActions, snackbarActions, useAppDispatch, useAppSelector } from '../redux';

const httpLink = createHttpLink({
  uri: 'http://127.0.0.1:3000/graphql',
});



export default function Apollo({ children }: { children: React.ReactNode }) {

  const credentials = useAppSelector(state => state.global.credentials);
  const dispatch = useAppDispatch();
  // Log any GraphQL errors or network error that occurred
  const errorLink = useMemo(() =>
    onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.map(({ message, locations, path }) =>
        dispatch(
          snackbarActions.showSnackbar({ message: `[GraphQL error]: ${message}, ${locations}, ${path}`, variant: "error" })
        )
      );
    if (networkError) {
      dispatch(
        snackbarActions.showSnackbar({ message: `[Network error]: ${networkError}`, variant: "error" })
      )
    }

    if (
      networkError &&
      networkError.name ==='ServerError' &&
      (networkError as ServerError).statusCode === 401
    ) {
      dispatch(
        globalActions.logout()
      );
    }
  }),
  [dispatch]);

  const authLink = useMemo(
    () => setContext((_, { headers }) => {
      return {
        
        headers: {
          ...headers,
          ...credentials?.accessToken ? {
            "Authorization": `Bearer ${credentials.accessToken}`,
            "access-token": credentials.accessToken,
            "token-type": credentials.tokenType,
            ...credentials,
          } : {},
        }
      }
    }),
    [JSON.stringify(credentials)],
  );
  
  const client = useMemo(() =>
    new ApolloClient({
      link: errorLink.concat(authLink).concat(httpLink),
      cache: new InMemoryCache(),
    }),
    [authLink]
  );

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  )
}