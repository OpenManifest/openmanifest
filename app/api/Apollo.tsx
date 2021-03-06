import { ApolloClient, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

import { setContext } from '@apollo/client/link/context';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import * as React from 'react';
import * as Update from 'expo-updates';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { relayStylePagination } from '@apollo/client/utilities';
import { actions, useAppDispatch, useAppSelector } from '../state';

export default function Apollo({ children }: { children: React.ReactNode }) {
  const httpBatchLink = React.useMemo(() => {
    console.log('Release channel', Update.releaseChannel);
    const environment =
      Platform.OS === 'web' ? Constants.manifest?.extra?.environment : Update.releaseChannel;
    return new BatchHttpLink({
      batchDebounce: true,
      batchMax: 10,
      uri:
        environment in (Constants?.manifest?.extra?.urls || {})
          ? Constants.manifest?.extra?.urls[environment]
          : Constants.manifest?.extra?.url,
    });
  }, []);
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

        if (graphQLErrors && process.env.EXPO_ENV === 'development') {
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
            // console.log(JSON.stringify(err));
            console.log(operation);
          });
        }
        if (networkError && process.env.EXPO_ENV === 'development') {
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
        link: errorLink.concat(authLink).concat(new RetryLink()).concat(httpBatchLink),
        cache: new InMemoryCache({
          typePolicies: {
            Event: relayStylePagination(),
          },
        }),
      }),
    [authLink, errorLink, httpBatchLink]
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
