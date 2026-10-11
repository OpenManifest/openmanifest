import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { StateStorage } from 'zustand/middleware';

export const SESSION_STORAGE_KEY = 'openmanifest.session.v1';
export const CREDENTIALS_STORAGE_KEY = 'openmanifest.credentials';

const isWeb = Platform.OS === 'web';

function webStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    // Access to localStorage throws when site data is blocked
    return null;
  }
}

/** Reads a raw string from the key-value storage the old redux-persist (and the session store) use. */
export async function getPlainItem(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

/** Credentials: SecureStore on native, localStorage on web (there is no secure storage in a browser). */
export const credentialStorage = {
  async get(): Promise<string | null> {
    if (isWeb) {
      return webStorage()?.getItem(CREDENTIALS_STORAGE_KEY) ?? null;
    }
    return SecureStore.getItemAsync(CREDENTIALS_STORAGE_KEY);
  },
  async set(value: string): Promise<void> {
    if (isWeb) {
      webStorage()?.setItem(CREDENTIALS_STORAGE_KEY, value);
      return;
    }
    await SecureStore.setItemAsync(CREDENTIALS_STORAGE_KEY, value);
  },
  async remove(): Promise<void> {
    if (isWeb) {
      webStorage()?.removeItem(CREDENTIALS_STORAGE_KEY);
      return;
    }
    await SecureStore.deleteItemAsync(CREDENTIALS_STORAGE_KEY);
  },
};

type PersistedBlob = { state?: Record<string, unknown>; version?: number };

/**
 * Storage for the zustand `persist` middleware that writes the `credentials` field of the persisted state to
 * `credentialStorage` and everything else to AsyncStorage (localStorage on web), so credentials never reach AsyncStorage.
 *
 * `fallback` supplies the initial blob when nothing has been stored yet (the migration from redux-persist); it is
 * written to the session's own storage before `afterRestore` runs, which is where the old copy gets deleted.
 */
export function createSessionStorage(
  fallback?: () => Promise<PersistedBlob | null>,
  afterRestore?: () => Promise<void>
): StateStorage {
  const storage: StateStorage = {
    async getItem(name) {
      const [plain, credentials] = await Promise.all([getPlainItem(name), credentialStorage.get()]);
      let blob: PersistedBlob | null = plain ? JSON.parse(plain) : null;
      let migrated = false;
      if (!blob && fallback) {
        blob = await fallback();
        migrated = !!blob;
      }
      let result: string | null = null;
      if (blob || credentials) {
        const state = { ...(blob?.state ?? {}) };
        if (credentials) {
          state.credentials = JSON.parse(credentials);
        }
        result = JSON.stringify({ version: blob?.version ?? 0, ...blob, state });
      }
      try {
        if (migrated && result) {
          await storage.setItem(name, result);
        }
        await afterRestore?.();
      } catch (error) {
        console.warn('[Session]: Could not finish migrating the stored session', error);
      }
      return result;
    },
    async setItem(name, value) {
      const blob: PersistedBlob = JSON.parse(value);
      const { credentials, ...rest } = blob.state ?? {};
      if (credentials) {
        await credentialStorage.set(JSON.stringify(credentials));
      } else {
        await credentialStorage.remove();
      }
      await AsyncStorage.setItem(name, JSON.stringify({ ...blob, state: rest }));
    },
    async removeItem(name) {
      await credentialStorage.remove();
      await AsyncStorage.removeItem(name);
    },
  };
  return storage;
}
