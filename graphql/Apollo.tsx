import { ApolloClient, createHttpLink, InMemoryCache, ServerError } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

import { setContext } from '@apollo/client/link/context';
import { onError } from "@apollo/client/link/error";
import React, { useCallback, useMemo } from 'react';
import Constants from "expo-constants";
import { globalActions, snackbarActions, useAppDispatch, useAppSelector } from '../redux';

const httpLink = createHttpLink({
  uri: Constants.manifest.extra.url,
});



export default function Apollo({ children }: { children: React.ReactNode }) {

  const credentials = useAppSelector(state => state.global.credentials);
  const dispatch = useAppDispatch();
  // Log any GraphQL errors or network error that occurred
  const errorLink = useMemo(() =>
    onError(({ graphQLErrors, networkError }) => {

      if (graphQLErrors?.some((err) => err.extensions?.code === "AUTHENTICATION_ERROR")) {
        dispatch(
          snackbarActions.showSnackbar({ message: `Session expires`, variant: "error" })
        )
        dispatch(
          globalActions.logout()
        );
        return;
      }
        
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

    }), [dispatch]);

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