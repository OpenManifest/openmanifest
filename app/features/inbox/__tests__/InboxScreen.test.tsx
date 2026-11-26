import * as React from 'react';
import { authenticatedSession } from 'app/__fixtures__/session.fixture';
import MOCK_QUERY_LOADS from 'app/__tests__/manifest/__mocks__/QueryLoads.mock';
import createMockedQuery from 'app/__tests__/manifest/__mocks__/createMockedQuery.mock';
import { InboxDocument, MarkNotificationSeenDocument } from 'app/api/reflection';
import { fireEvent, render, waitFor } from '../../../__mocks__/render';
import InboxScreen from '../InboxScreen';

jest.setTimeout(30000);

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
  useIsFocused: () => false,
}));

const notification = (id: string, extra: Record<string, unknown> = {}) => ({
  __typename: 'Notification',
  id,
  message: 'Load 3 is boarding',
  notificationType: 'boarding',
  isSeen: false,
  createdAt: '2026-10-20T01:00:00Z',
  sentBy: null,
  resource: { __typename: 'Load', id: '7', loadNumber: 3 },
  ...extra,
});

const inbox = (nodes: Record<string, unknown>[]) =>
  createMockedQuery(InboxDocument, { operatorId: '1', first: 30 }, {
    operator: {
      __typename: 'Operator',
      id: '1',
      currentUser: {
        __typename: 'Membership',
        id: '5',
        unseenNotifications: nodes.filter((node) => !node.isSeen).length,
        notifications: {
          __typename: 'NotificationConnection',
          edges: nodes.map((node) => ({ __typename: 'NotificationEdge', node })),
          pageInfo: { __typename: 'PageInfo', hasNextPage: false, endCursor: null },
        },
      },
    },
  } as never);

const markSeen = (id: string) => ({
  request: { query: MarkNotificationSeenDocument, variables: { id: Number(id) } },
  result: jest.fn(() => ({
    data: {
      updateNotification: {
        __typename: 'UpdateNotificationPayload',
        errors: null,
        notification: { __typename: 'Notification', id, isSeen: true },
      },
    },
  })),
});

async function renderInbox(nodes: Record<string, unknown>[], extra: unknown[] = []) {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  return render(<InboxScreen />, {
    session: authenticatedSession,
    graphql: [inbox(nodes)(), inbox(nodes)(), MOCK_QUERY_LOADS(), ...extra] as never,
  });
}

describe('<InboxScreen />', () => {
  beforeEach(() => mockNavigate.mockClear());
  afterEach(() => jest.restoreAllMocks());

  it('lists the notifications with the unread ones marked, and says how many', async () => {
    const screen = await renderInbox([
      notification('1'),
      notification('2', { isSeen: true, notificationType: 'credits_updated', resource: null }),
    ]);

    await waitFor(() => expect(screen.getByTestId('inbox-list')).toBeTruthy(), { timeout: 10000 });
    expect(screen.getByTestId('inbox-summary').props.children).toBe('1 unread');
    expect(screen.getByTestId('inbox-1-unread')).toBeTruthy();
    expect(screen.queryByTestId('inbox-2-unread')).toBeNull();
    expect(screen.getByText('Boarding call')).toBeTruthy();
    expect(screen.getByText('Your balance changed')).toBeTruthy();
  });

  it('opens the load of a call and marks the notification read', async () => {
    const seen = markSeen('1');
    const screen = await renderInbox([notification('1')], [seen]);
    await waitFor(() => expect(screen.getByTestId('inbox-1')).toBeTruthy(), { timeout: 10000 });

    await fireEvent.press(screen.getByTestId('inbox-1'));

    expect(mockNavigate).toHaveBeenCalledWith('Authenticated', {
      screen: 'Manifest',
      params: { screen: 'LoadScreen', params: { loadId: '7' }, initial: false },
    });
    await waitFor(() => expect(seen.result).toHaveBeenCalled());
  });

  it('does not ask again for a notification that is read', async () => {
    const seen = markSeen('2');
    const screen = await renderInbox(
      [notification('2', { isSeen: true, notificationType: 'credits_updated', resource: null })],
      [seen]
    );
    await waitFor(() => expect(screen.getByTestId('inbox-2')).toBeTruthy(), { timeout: 10000 });

    await fireEvent.press(screen.getByTestId('inbox-2'));

    expect(mockNavigate).toHaveBeenCalledWith('Authenticated', { screen: 'Wallet' });
    expect(seen.result).not.toHaveBeenCalled();
    expect(screen.getByTestId('inbox-summary').props.children).toBe('You are up to date');
  });

  it('says there is nothing when there is nothing', async () => {
    const screen = await renderInbox([]);

    await waitFor(() => expect(screen.getByTestId('inbox-empty')).toBeTruthy(), { timeout: 10000 });
  });
});
