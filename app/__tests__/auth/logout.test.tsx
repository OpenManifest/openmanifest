import * as React from 'react';
import { gql } from '@apollo/client';
import { act, render as rtlRender, waitFor } from '@testing-library/react-native';
import { initialSession, resetSession, useSession } from '../../state';
import type { SessionCredentials } from '../../state';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';

jest.setTimeout(30000);

// The real client is used, so its links need a browser global, a server URL and no websocket connection
jest.mock('app/constants/expo', () => ({
  __esModule: true,
  default: { url: 'http://localhost:5000/graphql', environment: 'local' },
}));
jest.mock('@rails/actioncable', () => ({
  createConsumer: () => ({ subscriptions: { create: jest.fn() } }),
}));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).self = global;

const WHOAMI = gql`
  query Whoami {
    currentUser {
      __typename
      id
      name
    }
  }
`;

const credentialsOf = (accessToken: string): SessionCredentials => ({
  accessToken,
  client: `client-${accessToken}`,
  uid: `${accessToken}@example.com`,
  tokenType: 'Bearer',
  expiry: '9999999999',
});

type Request = { operationName: string; variables: Record<string, unknown>; token: string | null };
const requests: Request[] = [];

/** Answers the batched GraphQL requests the app's HTTP link makes, naming the user after the token */
const fetchMock = jest.fn(async (_url: string, init: { body: string; headers: Headers }) => {
  const operations = JSON.parse(init.body) as { operationName: string; variables: object }[];
  const headers = new Headers(init.headers as never);
  const token = headers.get('access-token');
  const results = operations.map(({ operationName, variables }) => {
    requests.push({ operationName, variables: variables as never, token });
    if (operationName === 'UpdateUser') {
      return {
        data: {
          updateUser: {
            __typename: 'UpdateUserPayload',
            errors: null,
            fieldErrors: null,
            dropzoneUser: null,
          },
        },
      };
    }
    return { data: { currentUser: { __typename: 'User', id: token, name: `User ${token}` } } };
  });
  return { ok: true, status: 200, text: async () => JSON.stringify(results) };
});

describe('logging out and in again without a reload', () => {
  beforeEach(() => {
    requests.length = 0;
    fetchMock.mockClear();
    (global as unknown as { fetch: unknown }).fetch = fetchMock;
  });

  it('clears the first user’s data and the next user’s requests succeed', async () => {
    const { default: Apollo } = require('../../api/Apollo');
    const { getApolloClient } = require('../../api/client/registry');
    const { Text } = require('react-native');
    useSession.setState({
      ...initialSession,
      ...authenticatedSession,
      credentials: credentialsOf('a'),
      hydrated: true,
    });
    const screen = rtlRender(
      <Apollo>
        <Text>app</Text>
      </Apollo>
    );
    const client = getApolloClient();

    // User A
    const first = await client.query({ query: WHOAMI });
    expect(first.data.currentUser.name).toBe('User a');
    expect(requests.find((r) => r.operationName === 'Whoami')?.token).toBe('a');
    expect(JSON.stringify(client.cache.extract())).toContain('User a');

    // Log out
    await act(async () => {
      await resetSession({ reason: 'logout' });
    });
    expect(requests).toContainEqual({
      operationName: 'UpdateUser',
      variables: { pushToken: null },
      token: 'a',
    });
    expect(useSession.getState().credentials).toBeNull();
    expect(useSession.getState().currentDropzoneId).toBeNull();
    expect(client.cache.extract()).toEqual({});

    // User B logs in, in the same app session
    act(() => useSession.getState().setCredentials(credentialsOf('b')));
    await waitFor(async () => {
      const second = await client.query({ query: WHOAMI, fetchPolicy: 'network-only' });
      expect(second.data.currentUser.name).toBe('User b');
    });
    expect(requests.filter((r) => r.operationName === 'Whoami').pop()?.token).toBe('b');
    expect(JSON.stringify(client.cache.extract())).not.toContain('User a');
    screen.unmount();
  });

  it('does not wait for a server that cannot be reached', async () => {
    const { getApolloClient } = require('../../api/client/registry');
    useSession.setState({ ...initialSession, credentials: credentialsOf('a'), hydrated: true });
    jest
      .spyOn(getApolloClient() ?? { mutate: jest.fn() }, 'mutate')
      .mockReturnValue(new Promise(() => undefined) as never);
    jest.useFakeTimers();

    const reset = resetSession({ reason: 'logout' });
    jest.advanceTimersByTime(3500);
    await reset;

    jest.useRealTimers();
    expect(useSession.getState().credentials).toBeNull();
  });

  it('keeps one reset going when several requests report an expired session', async () => {
    useSession.setState({ ...initialSession, credentials: credentialsOf('a'), hydrated: true });

    const first = resetSession({ reason: 'authentication-error' });
    const second = resetSession({ reason: 'authentication-error' });

    expect(second).toBe(first);
    await first;
    expect(useSession.getState().credentials).toBeNull();
  });
});
