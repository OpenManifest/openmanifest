import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import * as React from 'react';
import Constants from 'expo-constants';
import { actions, useAppDispatch, useAppSelector } from '../state';

const httpLink = createHttpLink({
  uri: Constants.manifest.extra.url,
});

export default function Apollo({ children }: { children: React.ReactNode }) {
  const credentials = useAppSelector((root) => root.global.credentials);
  const dispatch = useAppDispatch();
  // Log any GraphQL errors or network error that occurred
  const errorLink = React.useMemo(
    () =>
      onError(({ graphQLErrors, networkError, operation, response }) => {
        if (graphQLErrors?.some((err) => err.extensions?.code === 'AUTHENTICATION_ERROR')) {
          dispatch(
            actions.notifications.showSnackbar({
              message: `Session expired`,
              variant: 'error',
            })
          );
          dispatch(actions.global.logout());
          return;
        }

        if (graphQLErrors && process.env.EXPO_ENV !== 'production') {
          graphQLErrors.forEach((err) => {
            const { message, locations, path, name, nodes } = err;
            dispatch(
              actions.notifications.showSnackbar({
                message: `[GraphQL error]: ${message}, ${JSON.stringify(locations)}, ${path}`,
                variant: 'error',
              })
            );
            console.error(
              `[GraphQL error]: ${message}, ${JSON.stringify(
                locations
              )}, ${path}, ${name}, ${nodes}`
            );
            console.error(JSON.stringify(err));
            console.error(operation);
          });
        }
        if (networkError) {
          dispatch(
            actions.notifications.showSnackbar({
              message: `[Network error]: ${networkError}`,
              variant: 'error',
            })
          );
        }
      }),
    [dispatch]
  );

  const authLink = React.useMemo(
    () =>
      setContext((_, { headers }) => {
        return {
          headers: {
            ...headers,
            ...(credentials?.accessToken
              ? {
                  Authorization: `Bearer ${credentials.accessToken}`,
                  'access-token': credentials.accessToken,
                  'token-type': credentials.tokenType,
                  ...credentials,
                }
              : {}),
          },
        };
      }),
    [credentials]
  );

  const client = React.useMemo(
    () =>
      new ApolloClient({
        link: errorLink.concat(authLink).concat(httpLink),
        cache: new InMemoryCache(),
      }),
    [authLink, errorLink]
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
