import { ApolloClient, createHttpLink, InMemoryCache, ServerError } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

import { setContext } from '@apollo/client/link/context';
import { onError } from "@apollo/client/link/error";
import * as React from 'react';
import Constants from "expo-constants";
import { actions, useAppDispatch, useAppSelector } from '../redux';

const httpLink = createHttpLink({
  uri: Constants.manifest.extra.url,
});



export default function Apollo({ children }: { children: React.ReactNode }) {

  const credentials = useAppSelector(state => state.global.credentials);
  const dispatch = useAppDispatch();
  // Log any GraphQL errors or network error that occurred
  const errorLink = React.useMemo(() =>
    onError(({ graphQLErrors, networkError }) => {

      if (graphQLErrors?.some((err) => err.extensions?.code === "AUTHENTICATION_ERROR")) {
        dispatch(
          actions.notifications.showSnackbar({ message: `Session expires`, variant: "error" })
        )
        dispatch(
          actions.global.logout()
        );
        return;
      }
        
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          dispatch(
            actions.notifications.showSnackbar({ message: `[GraphQL error]: ${message}, ${locations}, ${path}`, variant: "error" })
          )
        );
      if (networkError) {
        dispatch(
          actions.notifications.showSnackbar({ message: `[Network error]: ${networkError}`, variant: "error" })
        )
      }

    }), [dispatch]);

  const authLink = React.useMemo(
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
  
  const client = React.useMemo(() =>
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