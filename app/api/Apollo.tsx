import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

import { setContext } from '@apollo/client/link/context';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { onError } from '@apollo/client/link/error';
import * as React from 'react';
import * as Update from 'expo-updates';
import config from 'app/constants/expo';
import { Platform } from 'react-native';
import { createAppSignalLink, useAppSignal } from 'app/components/app_signal';
import { relayStylePagination } from '@apollo/client/utilities';
import { useNotifications } from 'app/providers/notifications';
import { actions, useAppDispatch, useAppSelector } from '../state';

const ERROR_CODE_WHITELIST = ['INSUFFICIENT_PERMISSIONS'];

export default function Apollo({ children }: { children: React.ReactNode }) {
  const notify = useNotifications();
  const httpBatchLink = React.useMemo(() => {
    console.log('Release channel', Update.releaseChannel);
    const environment =
      Platform.OS === 'web' ? config?.environment : config?.environment || Update.releaseChannel;
    const uri = environment in (config?.urls || {}) ? config?.urls[environment] : config?.url;
    console.warn({ uri, environment });
    return new BatchHttpLink({
      batchDebounce: true,
      batchMax: 10,
      uri,
    });
  }, []);
  const credentials = useAppSelector((root) => root.global.credentials);
  const dispatch = useAppDispatch();
  // Log any GraphQL errors or network error that occurred
  const errorLink = React.useMemo(
    () =>
      onError(({ graphQLErrors, networkError, operation, response }) => {
        if (graphQLErrors?.some((err) => err.extensions?.code === 'AUTHENTICATION_ERROR')) {
          notify.info(`Session expired`);
          dispatch(actions.global.logout());
          return;
        }

        if (graphQLErrors && process.env.EXPO_ENV === 'development') {
          graphQLErrors.forEach((err) => {
            const { message, locations, path, name, nodes } = err;
            notify.error(`[GraphQL error]: ${message}, ${JSON.stringify(locations)}, ${path}`);
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
          notify.error(`[Network error]: ${networkError}`);
        }
      }),
    [dispatch, notify]
  );

  const authLink = React.useMemo(
    () =>
      setContext((_, { headers }) => {
        return {
          headers: {
            ...headers,
            'Fly-Prefer-Region': 'syd',
            'Fly-Region': 'syd',
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

  const { appSignal } = useAppSignal();
  const appSignalLink = React.useMemo(
    () =>
      createAppSignalLink(appSignal, {
        breadcrumbs: {
          includeQuery: true,
          includeVariables: true,
          includeResponse: false,
        },
        ignore: ({ graphQLErrors }) =>
          graphQLErrors?.some((err) => err.extensions?.code === 'AUTHENTICATION_ERROR') || false,
        excludeError: (err) => ERROR_CODE_WHITELIST.includes(err.extensions?.code as string),
      }),
    [appSignal]
  );

  const link = React.useMemo(
    () => ApolloLink.from([errorLink, appSignalLink, authLink, httpBatchLink]),
    [appSignalLink, authLink, errorLink, httpBatchLink]
  );

  const client = React.useMemo(
    () =>
      new ApolloClient({
        link,
        cache: new InMemoryCache({
          typePolicies: {
            Event: relayStylePagination(),
            DropzoneUsers: relayStylePagination(),
            Loads: relayStylePagination(),
          },
        }),
      }),
    [link]
  );

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
