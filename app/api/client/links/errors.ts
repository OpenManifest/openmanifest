import { onError } from '@apollo/client/link/error';
import * as React from 'react';
import { useNotifications } from 'app/providers/notifications';
import { actions, useAppDispatch, useAppSelector } from 'app/state';

export const defaultErrorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors?.some((err) => err.extensions?.code === 'AUTHENTICATION_ERROR')) {
    console.error('[Apollo::Links::Errors::Default]: Authentication Error');
    return;
  }

  if (graphQLErrors && process.env.EXPO_ENV === 'development') {
    graphQLErrors.forEach((err) => {
      const { message, locations, path, name, nodes } = err;
      console.error(
        `[Apollo::Links::Errors::Default]: ${message}, ${JSON.stringify(
          locations
        )}, ${path}, ${name}, ${nodes}`
      );
      console.log(operation);
    });
  }
  if (networkError && process.env.EXPO_ENV === 'development') {
    console.error(`[Apollo::Links::Errors::Default::Network] ${networkError}`);
  }
});

export function useErrorLink() {
  const notify = useNotifications();
  const dispatch = useAppDispatch();
  const { authenticated } = useAppSelector((root) => root.global);
  // Log any GraphQL errors or network error that occurred
  return React.useMemo(
    () =>
      onError(({ graphQLErrors, networkError, operation }) => {
        if (graphQLErrors?.some((err) => err.extensions?.code === 'AUTHENTICATION_ERROR')) {
          notify.info(`Session expired`);
          if (authenticated) {
            console.debug(
              '[Apollo::Links::Errors]: Received authentication error, logging out',
              graphQLErrors
            );
            dispatch(actions.global.logout());
          }
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
    [dispatch, notify, authenticated]
  );
}
