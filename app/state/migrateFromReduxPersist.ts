import { getPlainItem } from './storage';

/** Key redux-persist used for the whole store (`persist:` + the `key` of the old persistConfig). */
export const LEGACY_REDUX_PERSIST_KEY = 'persist:open-manifest.0.9.1';

export type LegacySession = {
  credentials: {
    accessToken: string;
    client: string;
    uid: string;
    tokenType: string;
    expiry: string | number;
  } | null;
  currentDropzoneId: string | null;
  expoPushToken: string | null;
};

/**
 * Reads the session fields out of a redux-persist blob. redux-persist stores one JSON string per slice
 * (`{ "global": "<json>", "_persist": "<json>" }`). Returns null when there is no usable `global` slice.
 */
export function parseLegacySession(raw: string | null): LegacySession | null {
  if (!raw) {
    return null;
  }
  try {
    const slices = JSON.parse(raw) as Record<string, string>;
    const global = slices.global ? JSON.parse(slices.global) : null;
    if (!global) {
      return null;
    }
    const id = global.currentDropzoneId;
    return {
      credentials: global.credentials?.accessToken ? global.credentials : null,
      currentDropzoneId: id === null || id === undefined ? null : String(id),
      expoPushToken: global.expoPushToken ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * One-time migration: the first time the session store starts without its own storage entry, take the credentials,
 * current dropzone and push token the Redux `global` slice persisted. The legacy key is left in place (P4.8 removes it).
 */
export async function migrateFromReduxPersist(): Promise<{
  state: LegacySession;
  version: number;
} | null> {
  const legacy = parseLegacySession(await getPlainItem(LEGACY_REDUX_PERSIST_KEY));
  return legacy ? { state: legacy, version: 1 } : null;
}
