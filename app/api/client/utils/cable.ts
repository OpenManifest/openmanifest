import URI from 'urijs';
import { useSession } from 'app/state';
import type { SessionCredentials } from 'app/state/session';

/**
 * The cable URL for the server, with the devise token credentials in the query string: browsers cannot set headers on a
 * WebSocket, and the server rejects connections without a valid token.
 */
export function buildCableUrl(serverUrl: string, credentials: SessionCredentials | null): string {
  const uri = new URI(serverUrl);
  const base = `${uri.scheme() === 'https' ? 'wss://' : 'ws://'}${uri.host()}/subscriptions`;
  if (!credentials?.accessToken) return base;

  const query = [
    ['access-token', credentials.accessToken],
    ['client', credentials.client],
    ['uid', credentials.uid],
  ]
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return `${base}?${query}`;
}

type CableLike = { connect(): unknown; disconnect(): unknown };

/**
 * Reconnects the cable when the credentials change (login, logout, another account): the URL function is only called when
 * a connection is opened, so an open connection keeps the old identity until it is reopened.
 * Returns the function that stops watching.
 */
export function reconnectOnCredentialChange(
  cable: CableLike,
  store: Pick<typeof useSession, 'subscribe'> = useSession
) {
  return store.subscribe((state, previous) => {
    const next = state.credentials;
    const before = previous.credentials;
    if (next?.accessToken === before?.accessToken && next?.uid === before?.uid) return;

    cable.disconnect();
    // Existing channel subscriptions are re-sent (and re-authorised) when the connection opens again
    if (next?.accessToken) cable.connect();
  });
}
