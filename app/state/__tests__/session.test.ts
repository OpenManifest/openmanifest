import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory SecureStore standing in for the native keychain
const mockSecure = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockSecure.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecure.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecure.delete(key);
  }),
}));

const CREDENTIALS = {
  accessToken: 'token-1',
  client: 'client-1',
  uid: 'owner@example.com',
  tokenType: 'Bearer',
  expiry: '9999999999',
};

// What redux-persist wrote for the old store: one JSON string per slice
function legacyBlob(global: Record<string, unknown>) {
  return JSON.stringify({
    global: JSON.stringify({ authenticated: true, currentUser: null, permissions: [], ...global }),
    _persist: JSON.stringify({ version: -1, rehydrated: true }),
  });
}

/** Loads a fresh copy of the store module, which rehydrates from whatever the storage holds at that moment */
async function loadSession() {
  let mod: typeof import('../session');
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    mod = require('../session');
  });
  await mod!.useSession.persist.rehydrate();
  return mod!;
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(async () => {
  mockSecure.clear();
  await AsyncStorage.clear();
});

describe('session store', () => {
  it('starts logged out when nothing is stored', async () => {
    const { useSession } = await loadSession();
    const state = useSession.getState();

    expect(state.credentials).toBeNull();
    expect(state.currentDropzoneId).toBeNull();
    expect(state.hydrated).toBe(true);
  });

  it('migrates credentials, dropzone and push token from the redux-persist blob', async () => {
    await AsyncStorage.setItem(
      'persist:open-manifest.0.9.1',
      legacyBlob({
        credentials: CREDENTIALS,
        currentDropzoneId: 7,
        expoPushToken: 'ExponentPushToken[abc]',
        currentRouteName: 'ManifestScreen',
      })
    );

    const { useSession } = await loadSession();
    const state = useSession.getState();

    expect(state.credentials).toEqual(CREDENTIALS);
    expect(state.currentDropzoneId).toBe('7');
    expect(state.expoPushToken).toBe('ExponentPushToken[abc]');

    // The migrated session is stored (credentials in the secure store) and the old redux-persist key is deleted
    await flush();
    expect(JSON.parse(mockSecure.get('openmanifest.credentials') as string)).toEqual(CREDENTIALS);
    expect(
      JSON.parse((await AsyncStorage.getItem('openmanifest.session.v1')) as string).state
    ).toEqual({
      currentDropzoneId: '7',
      expoPushToken: 'ExponentPushToken[abc]',
    });
    expect(await AsyncStorage.getItem('persist:open-manifest.0.9.1')).toBeNull();
    expect(await AsyncStorage.getItem('openmanifest.session.v1')).not.toContain('token-1');
  });

  it('does not migrate when the redux blob has no credentials', async () => {
    await AsyncStorage.setItem(
      'persist:open-manifest.0.9.1',
      legacyBlob({ credentials: null, currentDropzoneId: null })
    );

    const { useSession } = await loadSession();

    expect(useSession.getState().credentials).toBeNull();
    expect(useSession.getState().currentDropzoneId).toBeNull();
  });

  it('prefers its own storage over the redux blob once it exists', async () => {
    await AsyncStorage.setItem(
      'persist:open-manifest.0.9.1',
      legacyBlob({ credentials: CREDENTIALS, currentDropzoneId: 7 })
    );
    await AsyncStorage.setItem(
      'openmanifest.session.v1',
      JSON.stringify({ version: 1, state: { currentDropzoneId: '9', expoPushToken: null } })
    );
    mockSecure.set(
      'openmanifest.credentials',
      JSON.stringify({ ...CREDENTIALS, accessToken: 'newer' })
    );

    const { useSession } = await loadSession();

    expect(useSession.getState().credentials?.accessToken).toBe('newer');
    expect(useSession.getState().currentDropzoneId).toBe('9');
    // A copy left behind by an earlier version is cleaned up as well
    await flush();
    expect(await AsyncStorage.getItem('persist:open-manifest.0.9.1')).toBeNull();
  });

  it('writes credentials to the secure store and never to AsyncStorage', async () => {
    const { useSession } = await loadSession();

    useSession.getState().setCredentials(CREDENTIALS);
    useSession.getState().setDropzone(3);
    await flush();

    expect(JSON.parse(mockSecure.get('openmanifest.credentials') as string)).toEqual(CREDENTIALS);
    const plain = JSON.parse((await AsyncStorage.getItem('openmanifest.session.v1')) as string);
    expect(plain.state.currentDropzoneId).toBe('3');
    expect(plain.state).not.toHaveProperty('credentials');
    expect(JSON.stringify(plain)).not.toContain('token-1');
  });

  it('reset logs out but keeps the device push token, and removes the stored credentials', async () => {
    const { useSession } = await loadSession();
    useSession.getState().setCredentials(CREDENTIALS);
    useSession.getState().setDropzone(3);
    useSession.getState().setPushToken('ExponentPushToken[abc]');
    await flush();

    useSession.getState().reset();
    await flush();

    const state = useSession.getState();
    expect(state.credentials).toBeNull();
    expect(state.currentDropzoneId).toBeNull();
    expect(state.expoPushToken).toBe('ExponentPushToken[abc]');
    expect(mockSecure.has('openmanifest.credentials')).toBe(false);
  });
});
