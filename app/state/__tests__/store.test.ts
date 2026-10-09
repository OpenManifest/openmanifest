import { persistMigrations } from '../store';

describe('redux-persist migration', () => {
  const legacyGlobal = {
    authenticated: true,
    credentials: { accessToken: 'token', client: 'client', uid: 'a@b.c' },
    currentDropzoneId: 7,
    expoPushToken: 'ExponentPushToken[abc]',
    currentRouteName: 'Manifest',
    currentUser: { id: '1' },
    currentDropzone: { id: '7' },
    permissions: ['readLoad'],
    theme: { dark: false },
    palette: {},
    isDarkMode: false,
  };

  it('drops the user and dropzone snapshots, the permissions and the theme', () => {
    const migrated = persistMigrations[1]({
      global: legacyGlobal,
      _persist: { version: -1, rehydrated: true },
    } as never) as unknown as { global: Record<string, unknown> };

    expect(Object.keys(migrated.global).sort()).toEqual([
      'authenticated',
      'credentials',
      'currentDropzoneId',
      'currentRouteName',
      'expoPushToken',
    ]);
  });

  it('keeps what the session store migrates from', () => {
    const migrated = persistMigrations[1]({ global: legacyGlobal } as never) as unknown as {
      global: typeof legacyGlobal;
    };

    expect(migrated.global.credentials).toEqual(legacyGlobal.credentials);
    expect(migrated.global.currentDropzoneId).toBe(7);
    expect(migrated.global.expoPushToken).toBe(legacyGlobal.expoPushToken);
  });

  it('leaves an empty state alone', () => {
    expect(persistMigrations[1](undefined as never)).toBeUndefined();
  });
});
