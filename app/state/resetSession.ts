import { UpdateUserDocument } from 'app/api/reflection';
import { getApolloClient } from 'app/api/client/registry';
import { useThemeOverrides } from '../theme/overrides';
import { useSession } from './session';

export type ResetSessionReason = 'logout' | 'authentication-error';

/** Gives up waiting for the server this long after logging out, so a bad connection cannot keep someone logged in */
const PUSH_TOKEN_TIMEOUT_MS = 3000;

/** Tells the server to stop sending this device's push notifications to the user who is logging out (BUG-018). */
async function clearPushToken() {
  const client = getApolloClient();
  if (!client || !useSession.getState().credentials?.accessToken) {
    return;
  }
  await Promise.race([
    client.mutate({ mutation: UpdateUserDocument, variables: { pushToken: null } }),
    new Promise((resolve) => setTimeout(resolve, PUSH_TOKEN_TIMEOUT_MS)),
  ]);
}

/**
 * Logs the user out and forgets everything about their session: the push token on the server (when the credentials are
 * still valid), in-flight requests, the Apollo cache, the credentials (secure storage) and the current dropzone.
 * Used by the logout action and when the server says the session has expired.
 */
export function resetSession({ reason }: { reason: ResetSessionReason }) {
  // Several requests can report an expired session at once: reset once
  if (!resetting) {
    resetting = performReset(reason).finally(() => {
      resetting = null;
    });
  }
  return resetting;
}

let resetting: Promise<void> | null = null;

async function performReset(reason: ResetSessionReason) {
  console.debug(`[Session::reset]: Resetting the session (${reason})`);
  const client = getApolloClient();

  if (reason === 'logout') {
    try {
      await clearPushToken();
    } catch (error) {
      // Offline, or the server refused: logging out has to work anyway
      console.debug('[Session::reset]: Could not clear the push token', error);
    }
  }

  client?.stop();
  useSession.getState().reset();
  useThemeOverrides.getState().setPrimary(null);
  await client?.clearStore();
}
