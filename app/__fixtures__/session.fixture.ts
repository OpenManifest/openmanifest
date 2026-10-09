import type { SessionCredentials } from 'app/state/session';

export const credentials: SessionCredentials = {
  accessToken: 'jest',
  client: 'jest',
  uid: 'jest@example.com',
  tokenType: 'Bearer',
  expiry: 9999999999,
};

/** A logged-in session with dropzone 1 selected, for `render(ui, { session: authenticatedSession })` */
export const authenticatedSession = {
  credentials,
  currentDropzoneId: '1',
};
