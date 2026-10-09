import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { migrateFromReduxPersist, removeLegacyReduxPersist } from './migrateFromReduxPersist';
import { createSessionStorage, SESSION_STORAGE_KEY } from './storage';

export type SessionCredentials = {
  accessToken: string;
  client: string;
  uid: string;
  tokenType: string;
  expiry: string | number;
};

type SessionData = {
  credentials: SessionCredentials | null;
  currentDropzoneId: string | null;
  expoPushToken: string | null;
  currentRouteName: string | null;
};

type SessionActions = {
  setCredentials(credentials: SessionCredentials): void;
  clearCredentials(): void;
  setDropzone(id: string | number | null | undefined): void;
  setPushToken(token: string | null): void;
  setRoute(name: string | null): void;
  /** Back to the logged-out state (keeps the push token, which belongs to the device) */
  reset(): void;
  setHydrated(hydrated: boolean): void;
};

export type SessionState = SessionData & SessionActions & { hydrated: boolean };

export const initialSession: SessionData = {
  credentials: null,
  currentDropzoneId: null,
  expoPushToken: null,
  currentRouteName: null,
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      ...initialSession,
      hydrated: false,
      setCredentials: (credentials) =>
        set({
          credentials: {
            accessToken: credentials.accessToken,
            client: credentials.client,
            uid: credentials.uid,
            tokenType: credentials.tokenType,
            expiry: credentials.expiry,
          },
        }),
      clearCredentials: () => set({ credentials: null }),
      setDropzone: (id) =>
        set({ currentDropzoneId: id === null || id === undefined ? null : String(id) }),
      setPushToken: (token) => set({ expoPushToken: token }),
      setRoute: (name) => set({ currentRouteName: name }),
      reset: () =>
        set((state) => ({
          ...initialSession,
          expoPushToken: state.expoPushToken,
          currentRouteName: null,
        })),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: SESSION_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() =>
        createSessionStorage(migrateFromReduxPersist, removeLegacyReduxPersist)
      ),
      // The route is not worth restoring and the flag is runtime-only
      partialize: ({ credentials, currentDropzoneId, expoPushToken }) => ({
        credentials,
        currentDropzoneId,
        expoPushToken,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('[Session]: Could not restore the session', error);
        }
        // Flag it either way so the app can render; deferred because `useSession` is not assigned yet when a
        // synchronous storage finishes during `create`
        Promise.resolve().then(() => useSession.setState({ hydrated: true }));
      },
    }
  )
);

/** Whether the user is logged in: the session holds an access token */
export const useAuthenticated = () => useSession((session) => !!session.credentials?.accessToken);
