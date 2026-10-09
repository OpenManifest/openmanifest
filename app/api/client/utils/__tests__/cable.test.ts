import { buildCableUrl, reconnectOnCredentialChange } from '../cable';

const CREDENTIALS = {
  accessToken: 'tok+en/with=chars',
  client: 'cli ent',
  uid: 'apple.1234@privaterelay.appleid.com',
  tokenType: 'Bearer',
  expiry: '123',
};

describe('buildCableUrl', () => {
  it('uses wss for https servers and ws for http servers', () => {
    expect(buildCableUrl('https://api.example.com/graphql', null)).toBe(
      'wss://api.example.com/subscriptions'
    );
    expect(buildCableUrl('http://localhost:5000/graphql', null)).toBe(
      'ws://localhost:5000/subscriptions'
    );
  });

  it('adds the url-encoded credentials', () => {
    const url = new URL(buildCableUrl('https://api.example.com/graphql', CREDENTIALS));

    expect(url.origin).toBe('wss://api.example.com');
    expect(url.pathname).toBe('/subscriptions');
    expect(url.searchParams.get('access-token')).toBe(CREDENTIALS.accessToken);
    expect(url.searchParams.get('client')).toBe(CREDENTIALS.client);
    expect(url.searchParams.get('uid')).toBe(CREDENTIALS.uid);
    expect(url.search).toContain('access-token=tok%2Ben%2Fwith%3Dchars');
  });

  it('adds nothing without an access token', () => {
    expect(
      buildCableUrl('https://api.example.com/graphql', { ...CREDENTIALS, accessToken: '' })
    ).toBe('wss://api.example.com/subscriptions');
  });
});

describe('reconnectOnCredentialChange', () => {
  const setup = () => {
    let listener: (state: any, previous: any) => void = () => {};
    const store = {
      subscribe: jest.fn((fn) => {
        listener = fn;
        return () => {};
      }),
    };
    const cable = { connect: jest.fn(), disconnect: jest.fn() };
    reconnectOnCredentialChange(cable, store as any);
    return {
      cable,
      change: (credentials: any, previous: any) =>
        listener({ credentials }, { credentials: previous }),
    };
  };

  it('reconnects with the new identity on login', () => {
    const { cable, change } = setup();
    change(CREDENTIALS, null);

    expect(cable.disconnect).toHaveBeenCalledTimes(1);
    expect(cable.connect).toHaveBeenCalledTimes(1);
  });

  it('disconnects without reconnecting on logout', () => {
    const { cable, change } = setup();
    change(null, CREDENTIALS);

    expect(cable.disconnect).toHaveBeenCalledTimes(1);
    expect(cable.connect).not.toHaveBeenCalled();
  });

  it('ignores changes that keep the same token and user', () => {
    const { cable, change } = setup();
    change({ ...CREDENTIALS, expiry: '456' }, CREDENTIALS);

    expect(cable.disconnect).not.toHaveBeenCalled();
    expect(cable.connect).not.toHaveBeenCalled();
  });
});
