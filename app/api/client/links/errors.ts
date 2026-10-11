import { onError } from '@apollo/client/link/error';
import * as React from 'react';
import { useNotifications } from 'app/providers/notifications';
import { resetSession, useAuthenticated } from 'app/state';
import environment from 'app/constants/environment';

export const defaultErrorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors?.some((err) => err.extensions?.code === 'AUTHENTICATION_ERROR')) {
    console.error('[Apollo::Links::Errors::Default]: Authentication Error');
    return;
  }

  if (graphQLErrors && environment !== 'production') {
    graphQLErrors.forEach((err) => {
      const { message, locations, path } = err;
      console.error(
        `[Apollo::Links::Errors::Default]: ${message}, ${JSON.stringify(locations)}, ${path}`
      );
      console.log(operation);
    });
  }
  if (networkError && environment !== 'production') {
    console.error(`[Apollo::Links::Errors::Default::Network] ${networkError}`);
  }
});

export function useErrorLink() {
  const notify = useNotifications();
  const authenticated = useAuthenticated();
  // Log any GraphQL errors or network error that occurred
  return React.useMemo(
    () =>
      onError(({ graphQLErrors, networkError, operation, forward }) => {
        try {
          if (graphQLErrors?.some((err) => err.extensions?.code === 'AUTHENTICATION_ERROR')) {
            notify.info('Session expired');
            if (authenticated) {
              console.debug(
                '[Apollo::Links::Errors]: Received authentication error, logging out',
                graphQLErrors
              );
              resetSession({ reason: 'authentication-error' });
            }
            return;
          }

          if (graphQLErrors && environment !== 'production') {
            graphQLErrors.forEach((err) => {
              const { message, locations, path } = err;
              notify.error(`[GraphQL error]: ${message}, ${JSON.stringify(locations)}, ${path}`);
              console.error(`[GraphQL error]: ${message}, ${JSON.stringify(locations)}, ${path}`);
              // console.log(JSON.stringify(err));
              console.log(operation);
            });
          }
          if (networkError && environment !== 'production') {
            notify.error(`[Network error]: ${networkError}`);
          }
        } finally {
          forward?.(operation);
        }
      }),
    [notify, authenticated]
  );
}
