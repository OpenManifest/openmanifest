import type { ApolloClient } from '@apollo/client';

let current: ApolloClient<unknown> | null = null;

/** The app's Apollo client, for code that runs outside React (the error link, `resetSession`). */
export function setApolloClient(client: ApolloClient<unknown>) {
  current = client;
}

export function getApolloClient() {
  return current;
}
